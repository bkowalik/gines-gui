import akka.GinesActors
import play.api._

object Global extends GlobalSettings {

  override def onStart(app: Application): Unit = {
    super.onStart(app)
  }

  override def onStop(app: Application): Unit = {
    GinesActors.system.shutdown()
    super.onStop(app)
  }
}
