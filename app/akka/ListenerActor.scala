package akka

import akka.actor.{Props, Actor, ActorLogging}
import akka.zeromq._
import akka.zeromq.Listener

class ListenerActor(val ip: String, val port: Int) extends Actor with ActorLogging {
  val socket = ZeroMQExtension(context.system).newSocket(
  SocketType.Sub, Listener(self), Connect(s"tcp://$ip:$port"), Subscribe("gines"))

  def receive: Actor.Receive = {
    case Connecting => log.warning("Connecting")
    case m: ZMQMessage => log.debug("Message received")
    case _ => log.warning("Strange message")
  }
}

object ListenerActor {
  def apply(ip: String, port: Int) =
    Props(classOf[ListenerActor], ip, port)
}
