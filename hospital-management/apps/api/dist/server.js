"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./config/prisma");
const socket_1 = require("./config/socket");
require("./modules/appointment-reminder/reminder.worker");
const PORT = Number(process.env.PORT) || 3000;
const httpServer = (0, node_http_1.createServer)(app_1.default);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
(0, socket_1.initializeSocket)(io);
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});
async function startServer() {
    try {
        await prisma_1.prisma.$connect();
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Socket.IO running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
