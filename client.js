// ============================================
//  CHAT CLIENT  –  node client.js
// ============================================
const net = require("net");
const readline = require("readline");

const HOST = "127.0.0.1";
const PORT = 3000;

const socket = net.createConnection({ host: HOST, port: PORT }, () => {
  // Connected — set up stdin reader
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  rl.on("line", (line) => {
    socket.write(line + "\n");
  });

  rl.on("close", () => {
    socket.end();
  });
});

// Print anything the server sends
socket.on("data", (data) => {
  process.stdout.write(data.toString());
});

socket.on("close", () => {
  console.log("\n\x1b[31mDisconnected from server.\x1b[0m");
  process.exit(0);
});

socket.on("error", (err) => {
  if (err.code === "ECONNREFUSED") {
    console.error("\x1b[31mCould not connect to server. Is server.js running?\x1b[0m");
  } else {
    console.error("\x1b[31mConnection error:\x1b[0m", err.message);
  }
  process.exit(1);
});