import http from "http";
import WebSocket from "ws";
import express from "express";
import { Server } from "socket.io";
import { Socket } from "dgram";
import { instrument } from "@socket.io/admin-ui";

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
// const wsServer = SocketIO(httpServer);
const wsServer = new Server(httpServer, {
  cors: {
    // 이 URL 에서 사용하려는 서버에 액세스할 것임
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = new Array();
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });

  return publicRooms;
};

const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anonymouse";

  socket.onAny((event) => {
    // console.log(wsServer.sockets);
    // console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (res, callback) => {
    // res = { roomName, nickname: string }
    socket["nickname"] = res.nickname == "" ? "Anony" : res.nickname;

    socket.join(res.roomName); // cahtroom
    callback();
    socket
      .to(res.roomName)
      .emit("welcome", socket.nickname, countRoom(res.roomName));

    // broadcase
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, roomName, callback) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    callback();
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  // socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});
/*
const wsServer = new WebSocket.Server({ server });
const sockets = new Array();

wsServer.on("connection", (socket) => {
  sockets.push(socket);
  socket.send("Connection!! ✔");
  socket["nickname"] = "Anonymous";
  socket.on("close", () => {
    if (sockets.indexOf(socket)) {
      console.log(sockets.indexOf(socket));
      // sockets.remove(sockets.indexOf(socket));
    }

    console.log("close");
  });

  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "nickname":
        socket["nickname"] = message.payload;
        break;
      case "message":
        sockets.forEach((aSocket) => {
          if (aSocket != socket) {
            aSocket.send(`${socket.nickname}: ${message.payload}`);
          }
        });
        break;
      default:
        console.info("null");
    }
    console.log(message);
  });
});
*/

httpServer.listen(PORT, listenHandler);

// app.listen(PORT, listenHandler)
