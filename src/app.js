import http from "http";
import express from "express";
import SocketIO from "socket.io";

const app = express();
const PORT = 4000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/js"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/*", (req, res) => {
  res.redirect("/");
});

const listenHandler = () => {
  console.log(`Lisening http://localhost:${PORT}`);
};

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

httpServer.listen(PORT, listenHandler);
