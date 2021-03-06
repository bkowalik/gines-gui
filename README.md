# GINES GUI Client

This is client for Gines project (https://github.com/mikusp/gines) which is cellular automata simulation engine. Gines simulates virus epidemic using given parameters. This GUI project and Gines enginge is students' Bartosz Kowalik and Marcin Mikołajczyk project. Both projects are developed in Scala.

## Use
There are many ways to run Play!Framework application. The simpliest one is to download framework, add *play* command to path and inside project use *play run*. **Remember** to download Gines server and run it.

## Motivation
As I introduced earlier we have made the decision to separate GUI from simulation engine. This does not come without reason. We wanted to separate clients' traffic from engine to use all avaliable resources only for simulation. To do so, we used ZeroMQ (http://zeromq.org/) protocol implemented by Akka.io (http://doc.akka.io/docs/akka/2.2.3/scala/zeromq.html) in their framework. So that client (the GUI) subscribes and listens data from simulation engine. 

## Backend
Backend of this application stands on Play!Framework 2.2.1 (http://www.playframework.com/). We used Akka actors to provide communication between client and simulation server. There is also small administration feature also based on Akka actors. Both are using ZeroMQ to communicate over the network. This is very handy because we were able to send JSON objects. Listeners (in this case instances of GUI) are subscribed for data updates from server. Admin feature is based on request-response mechanism.

All updated data are published throughServer-Sent Events (http://en.wikipedia.org/wiki/Server-sent_events) to watchers' browsers. SSE is one way communication from server to client based on *text/event-stream* data. To provide admin feature we used another solution which is WebSockets (http://en.wikipedia.org/wiki/WebSocket) (I know that it is excessive but it was made for fun). Both SSE and WS in backend are implemented inside application's controller.

## Frontend
Fronted is based on very popular frameworks. For HTML and CSS we used Bootstrap (http://getbootstrap.com/) and AngularJS (http://angularjs.org/) for SSE and WS online site updates.

## Summary
There is a lot of work to do. For example make it possible to listen more than one simulation. But because of this is students' project and we have limited time to do this this project is an exapmle of interesing solution rather than complete application. Maybe it would be inspiration for someone.
