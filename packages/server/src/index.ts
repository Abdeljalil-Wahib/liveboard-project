// packages/server/src/index.ts
import fastify from "fastify";
import { Server, Socket } from "socket.io";
import cors from "@fastify/cors";

const server = fastify();

server.register(cors, {
  origin: "http://localhost:3000",
});

const io = new Server(server.server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// --- NEW: The server's memory ---
interface Point {
  x: number;
  y: number;
}
const roomStates: Record<string, Point[][]> = {};
// ---------------------------------

interface SocketWithRoom extends Socket {
  roomId?: string;
}

io.on("connection", (socket: SocketWithRoom) => {
  console.log("A user connected", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    console.log(`User ${socket.id} joined room ${roomId}`);

    // --- NEW: When a user joins, send them the current state of the canvas ---
    if (roomStates[roomId]) {
      // Send only to the newly connected client
      socket.emit("canvas-state", roomStates[roomId]);
    }
    // ------------------------------------------------------------------------
  });

  socket.on("start-drawing", (data) => {
    if (socket.roomId) {
      // --- MODIFIED: Update the state in memory ---
      if (!roomStates[socket.roomId]) {
        roomStates[socket.roomId] = [];
      }
      roomStates[socket.roomId].push([data]);
      // ------------------------------------------
      socket.to(socket.roomId).emit("start-drawing", data);
    }
  });

  socket.on("drawing", (data) => {
    if (socket.roomId) {
      // --- MODIFIED: Update the state in memory ---
      const lastLine =
        roomStates[socket.roomId][roomStates[socket.roomId].length - 1];
      if (lastLine) {
        lastLine.push(data);
      }
      // ------------------------------------------
      socket.to(socket.roomId).emit("drawing", data);
    }
  });

  socket.on("finish-drawing", () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("finish-drawing");
    }
  });

  socket.on("clear", () => {
    if (socket.roomId) {
      // --- MODIFIED: Clear the state in memory ---
      roomStates[socket.roomId] = [];
      // -----------------------------------------
      io.to(socket.roomId).emit("clear");
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
  });
});

const start = async () => {
  try {
    await server.listen({ port: 3001 });
    console.log("Server listening on http://localhost:3001");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();