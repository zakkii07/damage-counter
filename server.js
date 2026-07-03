const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { exec } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let counterData = {
  remainingDamage: 100000,
};

let ngrokStarted = false;

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

app.get("/start-ngrok", (req, res) => {
  if (!ngrokStarted) {
    exec(".\\ngrok.exe http 3000");
    ngrokStarted = true;
  }

  res.json({ message: "ngrok起動しました" });
});

app.get("/ngrok-url", async (req, res) => {
  try {
    const response = await fetch("http://127.0.0.1:4040/api/tunnels");
    const data = await response.json();

    const tunnel = data.tunnels.find(t => t.public_url.startsWith("https://"));

    if (!tunnel) {
      return res.json({ url: "" });
    }

    res.json({
      url: tunnel.public_url + "/overlay.html"
    });
  } catch (error) {
    res.json({ url: "" });
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`サーバー起動：http://localhost:${PORT}`);
});