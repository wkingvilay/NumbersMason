MiniDiscord 💬 — Terminal Chat App
A minimal Discord-like chat server you run entirely from your terminal.
Zero dependencies — just Node.js.
Quick Start
1. Start the server (Terminal 1)
node server.js
2. Connect as User 1 (Terminal 2)
node client.js
→ Enter a username e.g. alice
3. Connect as User 2 (Terminal 3)
node client.js
→ Enter a username e.g. bob

Commands
CommandWhat it doeshello everyoneBroadcast to all users in #general/dm bob hey!Send a private DM to bob/usersList who's online/quitDisconnect

How it works

server.js — TCP server using Node's built-in net module. Tracks connected users and routes messages.
client.js — TCP client that reads from stdin and writes server output to stdout.
No external packages needed — just Node.js.

Next steps to build toward Discord

Add rooms/channels (e.g. /join general)
Persist messages to a database (SQLite → PostgreSQL)
Add user authentication (passwords/tokens)
Build a web frontend with WebSockets
