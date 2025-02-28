import { asyncHandler } from "../../../../utils/response/error/error.handling.js";
import * as dbService from "../../../../DB/db.services.js";
import chatModel from "../../../../DB/model/chat.model.js";
import { successResponse } from "../../../../utils/response/success.response.js";
// import messageModel from "../../../../DB/model/message.model.js";

export const findOneChat = asyncHandler(async (req, res, next) => {
  const { destId } = req.params;

  const chat = await dbService.findOne({
    model: chatModel,
    filter: {
      $or: [
        { mainUser: req.user._id, subParticipant: destId },
        { mainUser: destId, subParticipant: req.user._id },
      ],
    },
    populate: [
      { path: "mainUser", select: "userName firstName lastName profilePic.secure_url" },
      { path: "subParticipant", select: "userName firstName lastName profilePic.secure_url" },
      { path: "messages.senderId", select: "userName firstName lastName profilePic.secure_url" },
    ],
  });

  return successResponse({
    res,
    message: "chat found",
    data: { chat },
  });
});


export const findRoomChat = asyncHandler(async (req, res, next) => {
    // const { roomId } = req.params;

    // const roomChat = await dbService.findOne({
    //   model: messageModel,
    //   filter: {
    //     roomId,
    //     },
    //     populate: [
    //         { path: "messages.senderId", select: "userName image.secure_url" },
    //       ],
    // });
    
      
  
    // return successResponse({
    //   res,
    //   message: "chat found",
    //   data: { roomChat },
    // });
  });
