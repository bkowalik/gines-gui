import akka.GinesActors
import play.api._

object Global extends GlobalSettings {
  override def onStop(app: Application): Unit = {
    GinesActors.system.shutdown()
  }
}
