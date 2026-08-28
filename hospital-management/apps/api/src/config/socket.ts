import { Server } from "socket.io";

let io: Server | null = null;

export function initializeSocket(socketServer: Server) {
  io = socketServer;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
}