"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
exports.getIO = getIO;
let io = null;
function initializeSocket(socketServer) {
    io = socketServer;
}
function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }
    return io;
}
