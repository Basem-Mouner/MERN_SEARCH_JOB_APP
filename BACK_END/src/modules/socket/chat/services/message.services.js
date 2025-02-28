import { authenticationSocket } from "../../../../middleWare/auth.socket.middleware.js";
import * as dbServices from "../../../../DB/db.services.js";
import chatModel from "../../../../DB/model/chat.model.js";
import userModel, { socketConnections } from "../../../../DB/model/user.model.js";
// import roomModel from "../../../../DB/model/Room.model.js";
// import messageModel from "../../../../DB/model/message.model.js";
import { paginate } from "../../../../utils/Pagination/Pagination.js";
import { roleTypes } from "../../../../middleWare/types/roleTypes.js";
import companyModel from "../../../../DB/model/company.model.js";
import jobModel from "../../../../DB/model/job.model.js";




//🚀
export const sendMessage = (socket) => {
  return socket.on("sendMessage", async (payloadMessage) => {
    const { data } = await authenticationSocket({ socket });
    if (!data.valid) {
      return socket.emit("socketErrorResponse", data);
    }
    const userId = data.user._id.toString();

    const { message, destId } = payloadMessage;
    console.log({ message, destId, userId });

    const chat = await dbServices.findOneAndUpdate({
      model: chatModel,
      filter: {
        $or: [
          { mainUser: userId, subParticipant: destId },
          { mainUser: destId, subParticipant: userId },
        ],
      },
      updateData: {
        $push: {
          messages: {
            message,
            senderId: userId,
          },
        },
      },
    });
    if (!chat) {
      await dbServices.create({
        model: chatModel,
        data: {
          mainUser: userId,
          subParticipant: destId,
          messages: [
            {
              message,
              senderId: userId,
            },
          ],
        },
      });
    }

    socket.emit("successMessage", { chat, message });
    socket.to(socketConnections.get(destId)).emit("receiveMessage", { message });

    return "done";
  });
};

export const sendHrChatStart = (socket) => {
  return socket.on("sendMessage", async (payloadMessage) => {
    const { data } = await authenticationSocket({ socket });
    if (!data.valid) {
      return socket.emit("socketErrorResponse", data);
    }
    const userId = data.user._id.toString();
    const userRole = data.user.role; // 🔹 Get user role
    const { message, destId,jobId } = payloadMessage;

    console.log({ message, destId,jobId ,userId, userRole });

 let existingChat = await dbServices.findOne({
  model: chatModel,
  filter: {
    $or: [
      { mainUser: userId, subParticipant: destId },
      { mainUser: destId, subParticipant: userId },
    ],
  },
});

if (!existingChat) {
   // ✅ Restrict conversation initiation to HR or Company Owner
  // ✅ Get the company where the user works (as HR or Owner)
  const job = await dbServices.findById({
   model: jobModel,
   id: jobId,
 });
 if (!job) {
   return socket.emit("socketErrorResponse", { message: "❌ Job not found!" });
 }
 const company = await dbServices.findOne({
   model: companyModel,
   filter: {
     _id: job.companyId,
     isDeleted: { $exists: false },
   }
 })
 if (!company) {
   return socket.emit("socketErrorResponse", { message: "❌ Company not found!" });
 }
 // ✅ Restrict to HRs and Company Owners
 const isCompanyOwner = company.createdBy.toString() === userId;
 const isHR = company.HRs.includes(userId);
 

  if (!isCompanyOwner && !isHR) {
    return socket.emit("socketErrorResponse", { message: "❌ Only HR or Company Owner can start a chat! if you user click start chat to hr" });
  }

  // ✅ If no chat exists, HR/Owner can create one
  existingChat = await dbServices.create({
    model: chatModel,
    data: {
      mainUser: userId,
      subParticipant: destId,
      messages: [{ message, senderId: userId }],
    },
  });
} else {
  // ✅ If chat exists, allow users to continue chatting
  await dbServices.findOneAndUpdate({
    model: chatModel,
    filter: { _id: existingChat._id },
    updateData: {
      $push: { messages: { message, senderId: userId } },
    },
  });
}

const chat=await dbServices.findById({
  model: chatModel,
  id: existingChat._id,
  populate:[{
    path:"messages.senderId",
    select:"userName firstName lastName profilePic.secure_url"
    
  },{
    path:"mainUser",
    select:"userName firstName lastName profilePic.secure_url"
  },
  {
    path:"subParticipant",
    select:"userName firstName lastName profilePic.secure_url"
  }
]
  
})

    socket.emit("successMessage", { chat, message,jobId });
    socket.to(socketConnections.get(destId)).emit("receiveMessage", { message,userId });

    return "done";
  });
};


// export const roomResponse = (socket, io) => {
//   // return socket.on("joinRoom", async (payloadMessage) => {
//   //   const { data } = await authenticationSocket({ socket });
//   //   if (!data.valid) {
//   //     return socket.emit("socketErrorResponse", data);
//   //   }
//   //   const userId = data.user._id.toString();
//   //   roomConnections.push(socketConnections.get(userId))
//   //   console.log(roomConnections);
    
    

   
//   //   const { roomId, userName } = payloadMessage;

//   //   const room = await dbServices.findOneAndUpdate({
//   //     model: roomModel,
//   //     filter: { _id: roomId },
//   //     updateData: {
//   //       $addToSet: {
//   //         users: userId,
//   //       },
//   //     },
//   //     populate:[{
//   //       path:"users",
//   //       select:"userName image.secure_url"
        
//   //      }]

//   //   });

//   //   socket.join(roomId);
//   //   // Broadcast to others in the room

//   //   io.to(roomId).emit("messageRoomResponse", {
//   //     message: `${userName} has joined the chat`,
//   //     room
//   //   });

//   //   console.log(`${userName} joined roomId: ${roomId} roomName: ${room.name}`);

//   //   return "done";
//   // });
// };

// export const RoomSendMessage = (socket,io) => {
//   // return socket.on("RoomSendMessage", async (payloadMessage) => {
//   //   const { data } = await authenticationSocket({ socket });
//   //   if (!data.valid) {
//   //     return socket.emit("socketErrorResponse", data);
//   //   }
//   //   const userId = data.user._id.toString();

//   //   const { roomId, senderId, content,profile } = payloadMessage;
//   //   console.log({ roomId, senderId, content });

//   //   const roomChat = await dbServices.findOneAndUpdate({
//   //     model: messageModel,
//   //     filter: {
//   //       roomId,
//   //     },
//   //     updateData: {
//   //       $push: {
//   //         messages: {
//   //           senderId,
//   //           content,
//   //         },
//   //       },
//   //     },
//   //     populate:[{
//   //       path:"messages.senderId",select: "userName image.secure_url"
//   //     }]
//   //   });
//   //   if (!roomChat) {
//   //     await dbServices.create({
//   //       model: messageModel,
//   //       data: {
//   //         roomId,
//   //         messages: [
//   //           {
//   //             senderId,
//   //             content,
//   //           },
//   //         ],
//   //       },
//   //     });
//   //   }
   

//   //   io.to(roomConnections).emit("successRoomMessage", {
//   //       message:  {
//   //           senderId,
//   //           content,
//   //           profile
//   //         },
//   //     });

//   //     console.log(  {
//   //       content,
//   //       sender:profile.userName
//   //     },);
      


//   //   return "done";
//   // });
// };

// export const leaveRoomResponse = (socket) => {
//   // return socket.on("LeaveRoom", async (payloadMessage) => {
//   //   const { data } = await authenticationSocket({ socket });
//   //   if (!data.valid) {
//   //     return socket.emit("socketErrorResponse", data);
//   //   }
//   //   const userId = data.user._id.toString();

//   //   console.log({userId,payloadMessage});
    



//   //   // roomConnections.push(socketConnections.get(userId))

//   //   const roomFilter=roomConnections.filter(ele=> ele!==socketConnections.get(userId))
//   //   console.log(roomFilter);
    

   
//   //   const { roomId, userName } = payloadMessage;

//   //   const room = await dbServices.findOneAndUpdate({
//   //     model: roomModel,
//   //     filter: { _id: roomId },
//   //     updateData: {
//   //       $pull: { 
//   //         users:userId
//   //        },        
//   //     },
//   //     populate:[{
//   //       path:"users",
//   //       select:"userName image.secure_url"
        
//   //      }]
//   //   });

//   //   socket.leave(roomId);
    
//   //   // Broadcast to all users in the room that the user left
//   //   socket.to(roomFilter).emit("successLeaveMessage", {
//   //     message: `${userName} has left the chat`,
//   //     room
//   //   });

//   //   console.log(`User ${userName} left room ${roomId} ${room.name}`);
 

//   //   // socket.to(roomConnections).emit("messageLeaveRoomResponse", {
//   //   //   message: `${userName}  Leave the chat`,
//   //   //   room
//   //   // });

//   //   // console.log(`${userName} leave  ${room.name} room`);

//   //   // return "done";
//   // });
// };
