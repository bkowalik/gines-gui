package controllers

import play.api._
import play.api.mvc._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.iteratee.{Iteratee, Enumeratee, Concurrent}
import play.api.libs.json.JsValue
import play.api.libs.EventSource
import akka.{SimulationAdminActor, ListenerActor, GinesActors}
import scala.util.{Success, Failure}
import akka.util.Timeout

object Application extends Controller {

  val (out, channel) = Concurrent.broadcast[JsValue]
  private val adminPort = Play.current.configuration.getString("gines.simulation.admin.port") match {
    case Some(p) => p.toInt
    case None => throw new Exception("Unable to read admin port from configuration")
  }

  private val port = Play.current.configuration.getString("gines.simulation.port") match {
    case Some(p) => p.toInt
    case None => throw new Exception("Unable to read port from configuration")
  }

  def filter(simHost: String) = Enumeratee.filter[JsValue] {
    json: JsValue => (json \ "serverHost").as[String] == simHost
  }

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def listSimulations = Action.async { request =>
    Future(Ok(views.html.listSimulations("")))
  }

  def listenSimulation(simHost: String) = Action.async {
    implicit val timeout: Timeout = 5000
    GinesActors.system.actorSelection(simHost).resolveOne().onComplete{
      //case Success(actor) => ???
      case Failure(ex) => GinesActors.system.actorOf(ListenerActor(simHost, port, channel))
    }

    val ret = Ok.chunked(out
      &> filter(simHost)
      &> Concurrent.buffer(50)
      &> EventSource()
    ).as("text/event-stream")

    Future(ret)
  }

  def admin(simHost: String) = WebSocket.using[JsValue] { request =>
    val (out, channel) = Concurrent.broadcast[JsValue]
    val admin = GinesActors.system.actorOf(SimulationAdminActor(simHost, adminPort))

    val in = Iteratee.foreach[JsValue] { msg =>
      admin ! msg
    }

    (in,out)
  }

  def contact = TODO
}