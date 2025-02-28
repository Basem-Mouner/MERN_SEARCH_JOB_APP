import { Server } from "socket.io";
import { logoutSocket, registerSocket } from "./services/chat.auth.services.js";
import {
  //  leaveRoomResponse,
  //   roomResponse, RoomSendMessage,
     sendHrChatStart, sendMessage } from "./services/message.services.js";
let io = undefined;
export const runIo = async (serverHttp) => {
  io = new Server(serverHttp, {
    cors: {
      origin: "*",
      // methods: ["GET", "POST"],
    },
  });

  //listen to connection event
  return io.on("connection", async (socket) => {
    console.log("connection stable");
    console.log(socket.handshake.auth);

    await registerSocket(socket);

    // await sendMessage(socket);
    await sendHrChatStart(socket);

    // await roomResponse(socket,io);
    // await RoomSendMessage(socket,io);
    // await leaveRoomResponse(socket);

    await logoutSocket(socket);

    // socket.on("hi", (data)=>{
    //   console.log(data);

    //   // socket.emit("hi", "hi from server"); //send to the client
    //   // io.emit("hi", "hi from server"); //send to all clients
    //   // socket.broadcast.emit("hi", "hi from server"); //send to all clients except the sender
    //   // socket.to(connections).emit("hi", "hi from server"); //send to all clients except the sender
    //   // io.to(connections).emit("hi", "hi from server"); //send to all clients and me
    //   // socket.to(connections[connections.length-2]).emit("hi", "hi from server"); //send to only one  clients
    //   // io.except(connections[connections.length-2]).emit("hi", "hi from server"); //send to all clients except one
    //   socket.except(connections[connections.length-2]).emit("hi", "hi from server"); //send to all clients except one and me

    // });
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
