require('dotenv').config();

const express = require("express");
const http = require("http"); 
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); 

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "*"
const PORT = process.env.PORT || "8000"

// Enable CORS
app.use(cors({ 
  origin: CLIENT_ORIGIN
}));

// Basic API route
app.get("/", (req, res) => {
  res.send("VidMeet backend is running 🚀");
});

// Create Socket.IO server with CORS
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// --- Socket.IO Logic Below ---

const nameToSocketIdMap = new Map();
const socketIdToNameMap = new Map();
const activeRooms = new Set();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("room:create", (data, callback) => {
    let code;
    do {
      code = generateRoomCode();
    } while (activeRooms.has(code));
    activeRooms.add(code);
    const { name } = data;
    nameToSocketIdMap.set(name, socket.id);
    socketIdToNameMap.set(socket.id, name);
    socket.join(code);
    callback({ code });
  });

  socket.on("room:join", data => {
    const { name, room } = data;
    if (!activeRooms.has(room)) {
      io.to(socket.id).emit("room:not_found", {
        error: `Room ${room} doesn't exist. Create it first.`,
      });
      return;
    }
    nameToSocketIdMap.set(name, socket.id);
    socketIdToNameMap.set(socket.id, name);
    socket.join(room);
    io.to(room).emit("user:joined", { name, id: socket.id });
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", {
      from: socket.id,
      name: socketIdToNameMap.get(socket.id),
      offer,
    });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("message:sent", ({ to, message }) => {
    message.sender = socketIdToNameMap.get(socket.id);
    io.to(to).emit("message:received", { from: socket.id, message });
  });

  socket.on("call:end", ({ to }) => {
    if (to) {
      io.to(to).emit("call:ended", { from: socket.id });
    } else {
      const rooms = [...socket.rooms].filter(r => r !== socket.id);
      if (rooms.length > 0) {
        io.to(rooms[0]).emit("call:ended", { from: socket.id });
      }
    }
    const name = socketIdToNameMap.get(socket.id);
    if (name) {
      nameToSocketIdMap.delete(name);
      socketIdToNameMap.delete(socket.id);
    }
  });

  socket.on("disconnect", () => {
    const name = socketIdToNameMap.get(socket.id);
    if (name) {
      nameToSocketIdMap.delete(name);
      socketIdToNameMap.delete(socket.id);
    }

    const rooms = [...socket.rooms].filter(r => r !== socket.id);
    rooms.forEach(room => {
      io.to(room).emit("user:disconnected", { id: socket.id });
      if (io.sockets.adapter.rooms.get(room)?.size <= 1) {
        activeRooms.delete(room);
      }
    });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
