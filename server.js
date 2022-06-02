const express = require("express");
const http = require("http");
const path = require("path");
const socket = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
const io = new socket.Server(httpServer);

const messages = [];

const logined = new Map();

class message {
  constructor(time, user, msg) {
    this.time = time;
    this.user = user;
    this.msg = msg;
  }
}

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "chat.html"));
});

app.get("/login", (req, res, next) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});


io.on("connection", (s) => {
  // on user login

  s.emit("online", logined.size);

  s.on("login", ({ username }) => {
    logined.set(s.id, username);

    s.emit("login", { id: s.id, username });

    s.broadcast.emit("online", logined.size);
  });

  io.on("disconnect", () => {
    logined.delete(s.id);
    s.broadcast.emit("online", logined.size);
  });

  s.on("check.login", (id) => {
    if (logined.has(id)) {
      return s.emit("check.login", true);
    }

    s.emit("check.login", false);
  });

  s.on("messages", () => {
    s.emit("messages", messages);
  });

  s.on("message", ({ msg, time, user }) => {
    messages.push(new message(time, user, msg));
    s.broadcast.emit("message", messages[messages.length - 1]);
  });
});

httpServer.listen(4000, () => {
  console.log("server is listen at 4000");
});
