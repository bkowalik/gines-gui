package akka

import akka.actor.{Props, Actor, ActorLogging}
import akka.zeromq._
import akka.zeromq.Listener
import play.api.libs.iteratee.Concurrent
import play.api.libs.json.{Json, JsValue}

class ListenerActor(val ip: String, val port: Int, val channel: Concurrent.Channel[JsValue]) extends Actor with ActorLogging {
  val socket = ZeroMQExtension(context.system).newSocket(
  SocketType.Sub, Listener(self), Connect(s"tcp://$ip:$port"), Subscribe("gines"))

  def receive: Actor.Receive = {
    case Connecting => log.debug("Connecting...")
    case m: ZMQMessage => {
      val payload = m.frame(1).utf8String
      val json = Json.parse(payload)
      //log.debug(json.toString)
      channel.push(json)
    }
    case Closed => log.debug("Connection closed")
    case _ => log.warning("Strange message")
  }
}

object ListenerActor {
  def apply(ip: String, port: Int, channel: Concurrent.Channel[JsValue]) =
    Props(classOf[ListenerActor], ip, port, channel)
}
