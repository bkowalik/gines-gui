package controllers

import play.api._
import play.api.mvc._
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import play.api.libs.iteratee.{Enumeratee, Concurrent}
import play.api.libs.json.JsValue
import play.api.libs.EventSource
import akka.GinesActors
import scala.util.{Success, Failure}

object Application extends Controller {

  val (out, channel) = Concurrent.broadcast[JsValue]

  def filter(simHost: String) = Enumeratee.filter[JsValue] {
    json: JsValue => (json \ "serverHost").as[String] == simHost
  }

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def listSimulations = Action.async { request =>
    Future(Ok(""))
  }

  def listenSimulation(simHost: String) = Action.async {
    implicit val timeout = 5000
    GinesActors.system.actorSelection(simHost).resolveOne().onComplete{
      case Success(actor) => ???
      case Failure(ex) => ???
    }

    val ret = Ok.chunked(out
      &> filter(simHost)
      &> Concurrent.buffer(50)
      &> EventSource()
    ).as("text/event-stream")

    Future(ret)
  }
}