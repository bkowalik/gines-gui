package akka

import akka.actor.{ActorRef, ActorLogging, Props, Actor}
import akka.zeromq._
import play.api.libs.json.{Json, JsValue}
import play.api.libs.iteratee.Concurrent.Channel
import akka.util.ByteString
import akka.SimulationAdminActor._
import akka.SimulationAdminActor.RemoteSimulation
import akka.zeromq.Listener
import akka.zeromq.Connect
import akka.SimulationAdminActor.SendCommand

class SimulationAdminActor extends Actor with ActorLogging {
  val connections = scala.collection.mutable.HashMap.empty[String, RemoteSimulation]

  def receive = {
    case m: ZMQMessage if m.frames.length == 3 && m.frame(0).utf8String == "gines" => {
      val host = m.frame(1).utf8String
      val msg = Json.parse(m.frame(2).utf8String)
      connections.get(host) map { remote =>
        remote.stream.push(msg)
      } getOrElse {
        log.debug(s"Got message from not connected host $host with content: $msg")
      }
    }

    case SendCommand(host, port, stream, cmd) => {
      connections get(host) map { remote =>
        log.debug(s"Message to $host: ${cmd.toString}")
        sendCommand(remote, host, cmd)
      } getOrElse {
        log.debug(s"First use of $host. Creating socket")
        val socket = ZeroMQExtension(context.system).newSocket(SocketType.Req, Listener(self), Connect(s"tcp://$host:$port"))
        val remote = RemoteSimulation(socket, stream)
        connections += host -> remote
        sendCommand(remote, host, cmd)
      }
    }
  }

  def sendCommand(remote: SimulationAdminActor.RemoteSimulation, host: String, cmd: JsValue) {
    try {
      remote.socket ! ZMQMessage(ByteString("gines"), ByteString(cmd.toString))
    } catch {
      case e: Exception => {
        connections -= host
        log.debug(s"Socket failure. Removing host $host")
      }
    }
  }
}

object SimulationAdminActor {
  def apply() = {
    Props[SimulationAdminActor]
  }

  private[SimulationAdminActor] case class RemoteSimulation(socket: ActorRef, stream: Channel[JsValue])

  case class SendCommand(host: String, port: Int, stream: Channel[JsValue], cmd: JsValue)
}