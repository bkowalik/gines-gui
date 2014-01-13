package akka

import akka.actor.ActorSystem

object GinesActors {
  val system = ActorSystem("gines-gui")
  val adminActor = system.actorOf(SimulationAdminActor(), name="global-administrator")
}
