import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to Socket.IO:", socket.id);
});

socket.on("notification:new", (notification) => {
  console.log("\n🔔 REALTIME NOTIFICATION RECEIVED:");
  console.log(notification);
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO");
});