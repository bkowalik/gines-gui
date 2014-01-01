name := "gines-gui"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache,
  "com.typesafe.akka" % "akka-zeromq_2.10" % "2.2.3",
  "org.webjars" % "webjars-play" % "2.1.0-1",
  "org.webjars" % "bootstrap" % "3.0.3",
  "org.webjars" % "angularjs" % "1.2.3",
  "org.webjars" % "webjars-locator" % "0.6"
)     

play.Project.playScalaSettings
