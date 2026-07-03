const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let counterData = {
  remainingDamage: 100000,
};

io.on("connection", (socket) => {
  socket.emit("updateCounter", counterData);

  socket.on("changeDamage", (amount) => {
    counterData.remainingDamage += Number(amount);
    io.emit("updateCounter", counterData);
  });

  socket.on("setDamage", (amount) => {
    counterData.remainingDamage = Number(amount);
    io.emit("updateCounter", counterData);
  });

  socket.on("resetCounter", () => {
    counterData.remainingDamage = 100000;
    io.emit("updateCounter", counterData);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`サーバー起動：http://localhost:${PORT}`);
});