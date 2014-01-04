package akka

import akka.actor.{Props, Actor}
import akka.zeromq.{Connect, Listener, SocketType, ZeroMQExtension}

class SimulationAdminActor(val host: String, val port: Int) extends Actor {
  val socket = ZeroMQExtension(context.system).newSocket(SocketType.Req, Listener(self),
    Connect(s"tcp://$host:$port"))
  def receive: Actor.Receive = ???
}

object SimulationAdminActor {
  def apply(host: String, port: Int) = {
    Props(classOf[SimulationAdminActor], host, port)
  }
}