// ============================================
//  CHAT SERVER  –  node server.js
// ============================================
const net = require("net");
const readline = require("readline");

const PORT = 3000;
const clients = new Map(); // username -> socket

function broadcast(message, senderName) {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  for (const [name, socket] of clients) {
    if (name !== senderName) {
      socket.write(`\x1b[36m[${timestamp}] ${senderName}:\x1b[0m ${message}\n`);
    }
  }
}

function dmUser(toName, fromName, message) {
  const target = clients.get(toName);
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (target) {
    target.write(`\x1b[35m[${timestamp}] DM from ${fromName}:\x1b[0m ${message}\n`);
    return true;
  }
  return false;
}

function listUsers() {
  return [...clients.keys()].join(", ") || "(no users)";
}

function serverLog(msg) {
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  console.log(`\x1b[33m[${timestamp}]\x1b[0m ${msg}`);
}

const server = net.createServer((socket) => {
  let username = null;

  socket.write("\x1b[32m╔══════════════════════════════════╗\x1b[0m\n");
  socket.write("\x1b[32m║     Welcome to MiniDiscord 💬    ║\x1b[0m\n");
  socket.write("\x1b[32m╚══════════════════════════════════╝\x1b[0m\n");
  socket.write("Enter your username: ");

  const rl = readline.createInterface({ input: socket });

  rl.on("line", (line) => {
    const input = line.trim();
    if (!input) return;

    // ── First message = set username ──
    if (!username) {
      if (clients.has(input)) {
        socket.write(`\x1b[31mUsername "${input}" is taken. Try another: \x1b[0m`);
        return;
      }
      username = input;
      clients.set(username, socket);
      serverLog(`${username} joined (${clients.size} online)`);

      socket.write(`\x1b[32mWelcome, ${username}! 🎉\x1b[0m\n`);
      socket.write(`\x1b[90mCommands:\x1b[0m\n`);
      socket.write(`\x1b[90m  /dm <user> <msg>  – send a direct message\x1b[0m\n`);
      socket.write(`\x1b[90m  /users            – list online users\x1b[0m\n`);
      socket.write(`\x1b[90m  /quit             – disconnect\x1b[0m\n`);
      socket.write(`\x1b[90m  <message>         – broadcast to everyone\x1b[0m\n\n`);

      // Announce to others
      broadcast(`\x1b[32m** ${username} has joined the server **\x1b[0m`, username);
      return;
    }

    // ── Commands ──
    if (input === "/quit") {
      socket.end();
      return;
    }

    if (input === "/users") {
      socket.write(`\x1b[33mOnline users:\x1b[0m ${listUsers()}\n`);
      return;
    }

    if (input.startsWith("/dm ")) {
      const parts = input.slice(4).split(" ");
      const toName = parts[0];
      const msg = parts.slice(1).join(" ");

      if (!toName || !msg) {
        socket.write(`\x1b[31mUsage: /dm <username> <message>\x1b[0m\n`);
        return;
      }
      if (toName === username) {
        socket.write(`\x1b[31mYou can't DM yourself!\x1b[0m\n`);
        return;
      }

      const sent = dmUser(toName, username, msg);
      if (sent) {
        const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        socket.write(`\x1b[35m[${timestamp}] DM to ${toName}:\x1b[0m ${msg}\n`);
        serverLog(`DM: ${username} → ${toName}`);
      } else {
        socket.write(`\x1b[31mUser "${toName}" not found. Online: ${listUsers()}\x1b[0m\n`);
      }
      return;
    }

    if (input.startsWith("/")) {
      socket.write(`\x1b[31mUnknown command. Type /users, /dm, or /quit\x1b[0m\n`);
      return;
    }

    // ── Broadcast message ──
    serverLog(`[#general] ${username}: ${input}`);
    broadcast(input, username);
  });

  socket.on("close", () => {
    if (username) {
      clients.delete(username);
      serverLog(`${username} left (${clients.size} online)`);
      broadcast(`\x1b[31m** ${username} has left the server **\x1b[0m`, username);
    }
    rl.close();
  });

  socket.on("error", () => {
    if (username) clients.delete(username);
    rl.close();
  });
});

server.listen(PORT, () => {
  console.log("\x1b[32m╔══════════════════════════════════╗\x1b[0m");
  console.log("\x1b[32m║   MiniDiscord Server Running 🚀  ║\x1b[0m");
  console.log("\x1b[32m╚══════════════════════════════════╝\x1b[0m");
  console.log(`\x1b[33mListening on port ${PORT}\x1b[0m`);
  console.log(`\x1b[90mConnect with: node client.js\x1b[0m\n`);
});