import "dotenv/config";

import { createServer } from "node:http";
import { Server } from "socket.io";

import app from "./app";
import { prisma } from "./config/prisma";
import { initializeSocket } from "./config/socket";
import "./modules/appointment-reminder/reminder.worker";

const PORT = Number(process.env.PORT) || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initializeSocket(io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

async function startServer() {
  try {
    await prisma.$connect();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();