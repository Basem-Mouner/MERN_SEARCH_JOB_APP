import { successResponse } from "../../../utils/response/success.response.js";
import { asyncHandler } from "../../../utils/response/error/error.handling.js";
import userModel from "../../../DB/model/user.model.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import { verifyToken } from "../../../utils/security/token/token.js";
// import messageModel from "../../../DB/model/message.model.js";
import * as dbService from "../../../DB/db.services.js";
import { emailEvent } from "../../../utils/events/sendEmail.event.js";
import { cloud } from "../../../utils/multer/cloudinary.js";
// import postModel from "../../../DB/model/post.model.js";
import { roleTypes } from "../../../middleWare/types/roleTypes.js";
import friendRequestModel from "../../../DB/model/friendRequest.model.js";
// import roomModel from "../../../DB/model/Room.model.js";
import { subjectTypes } from "../../../middleWare/types/subjectTypes.js";

//-2-✅
export const userProfile = asyncHandler(async (req, res, next) => {
 
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: req.user._id },
    populate: [

      {
        path: "viewers.userId",
        select: "userName email",
      },
      // {
      //   path: "friends",
      //   select: "userName image.secure_url",
      // },
      // {
      //   path: "rooms",
      //   select: "name users",
      // },
    ],
  });

  return successResponse({
    res,
    message: "users profile by id",
    data: {user},
  });
});
//-1-✅
export const userProfileUpdate = asyncHandler(async (req, res, next) => {
  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id, isDeleted: {$exists:false} },
    updateData: req.body,
    options: { runValidators: true },
  });
  return successResponse({
    res,
    message: "users profile updated",
    data: { user },
  });
});
//-3-✅
//contain viewers section 📌
export const shareUserProfile = asyncHandler(async (req, res, next) => {
  const { profileId } = req.params;

  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: profileId, isDeleted: {$exists:false} },
    select: "userName firstName lastName mobileNumber profilePic.secure_url coverPic.secure_url",
  });

  if (!user) {
    return new Error("In-Valid Account Id", { cause: 400 });
  }
//===================🔥 ,😊,💪===================================
  if (profileId != req.user._id.toString()) {
    const currentTime = new Date();
    const maxVisits = 5; // الحد الأقصى لعدد السجلات لكل مستخدم

    //  تحقق إذا كان المستخدم موجودًا في viewers
    const existingViewer = await dbService.findOne({
      model: userModel,
      filter: {
        _id: profileId, // المستخدم الذي تمت زيارته
        "viewers.userId": req.user._id,
      },
    });

    if (existingViewer) {
      // المستخدم موجودا: تحديث مصفوفة الوقت
      await dbService.updateOne({
        model: userModel,
        filter: { _id: profileId, "viewers.userId": req.user._id },
        updateData: {
          $push: {
            "viewers.$.time": {
              $each: [currentTime], // إضافة الوقت الحالي
              $slice: -maxVisits, // الاحتفاظ بآخر 5 تواريخ فقط
              $sort: -1, // ترتيب تواريخ من الأحدث إلى الأقدم
            },
          },
        },
      });
    } else {
      // المستخدم غير موجودا: إضافة إدخال جديد
      await dbService.updateOne({
        model: userModel,
        filter: { _id: profileId },
        updateData: {
          $addToSet: {
            viewers: {
              userId: req.user._id,
              time: [currentTime], // الوقت الحالي كإدخال جديد
            },
          },
        },
      });
    }
  }
//=================================================================

  return user
    ? successResponse({
        res,
        status: 200,
        data: {
          userName:user.userName,
          mobileNumber:user.mobileNumber,
          profilePic:user.profilePic.secure_url,
          coverPic:user.coverPic.secure_url
        },
      })
    : next(new Error("in-valid account", { cause: 404 }));
});
//-4-✅
export const passwordUpdate = asyncHandler(async (req, res, next) => {
  const { oldPassword, password } = req.body;
  if (!compareHash(oldPassword, req.user.password)) {
    return next(new Error("old password is not match", { cause: 400 }));
  }

  await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    updateData: {
      password: generateHash(password),
      changeCredentialTime: Date.now(),
    },
    options: {
      runValidators: true,
    },
  });

  return successResponse({
    res,
    message: "password updated",
    data: {},
  });
});
//_____________________________________________________________________________
//-5-✅
export const updateImageProfile = asyncHandler(async (req, res, next) => {
  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/users/${req.user._id}/profileImage`,
    // publicId: req.user._id,
    // resourceType: "image",
  });
  const user=await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    updateData: {
      // image: req.file.finalPath, //case local storage
      profilePic: { secure_url, public_id },  //case cloud storage
    },
  });

  return successResponse({
    res,
    message: "",
    data: {
      // file: req.file,
      cloudData: { secure_url, public_id },
    },
  });
});
//-6-✅
export const deleteImageProfile  = asyncHandler(async (req, res, next) => {
 // 🔹 Get the user from the database
 const user = await dbService.findById({
  model: userModel,
  id: req.user._id,
});

if (!user || !user.profilePic?.public_id) {

return next(new Error("❌ No image found to delete." ,{cause:404}));
 
}

// 🔥 Delete image from Cloudinary
await cloud.uploader.destroy(user.profilePic.public_id);

// ✅ Update user profile (remove profilePic field)
await dbService.findByIdAndUpdate({
  model: userModel,
  id: req.user._id,
  updateData: {
    $unset:{profilePic: null }}
});

return successResponse({
  res,
  message: "✅ Profile image deleted successfully.",
});
});
//-7-✅
export const updateImageCover = asyncHandler(async (req, res, next) => {
  const images = [];
  for (const file of req.files) {
     const { secure_url, public_id } = await cloud.uploader.upload(
       file.path,
       {
         folder: `${process.env.APP_NAME}/user/${req.user._id}/coverImages`, 
       }
    );
    images.push({ secure_url, public_id } );
  }

  const user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    updateData: {
      // coverPic: req.files.map((file) => file.finalPath),   //local storage
      coverPic: images,  //cloud storage
    }
  });

  return successResponse({
    res,
    message: "",
    data: {
      // file: req.files,
      userCoverImages:user.coverPic,
    },
  });
});
//-8-✅
export const deleteCoverImage  = asyncHandler(async (req, res, next) => {
  const { public_id } = req.body; // 🔹 Get public_id from request body

  if (!public_id) {
    return next(new Error("❌ Public ID is required!" ,{cause:404}));
  }

  // 🔹 Get the user from the database
  const user = await dbService.findById({
    model: userModel,
    id: req.user._id,
  });

  if (!user || !user.coverPic || user.coverPic.length === 0) {
    return next(new Error("❌ No cover images found!" ,{cause:404}));
  }

  // 🔍 Find the image in the user's coverPic array
  const imageIndex = user.coverPic.findIndex((img) => img.public_id === public_id);

  if (imageIndex === -1) {
    return next(new Error("❌ Image not found in cover images!" ,{cause:404}));
  }

  // 🔥 Delete image from Cloudinary
  await cloud.uploader.destroy(public_id);

  // ✅ Remove the image from the user's coverPic array
  user.coverPic.splice(imageIndex, 1);

  // 🔄 Update the user in the database
  await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    updateData: { coverPic: user.coverPic },
  });

  return successResponse({
    res,
    message: "✅ Cover image deleted successfully.",
    data: user.coverPic, // 🔹 Return updated cover images
  });
});
//___________________________________________________________________________________
//-9- ✅ 🔥 Soft delete user
export const softDeleteUser = asyncHandler(async (req, res, next) => {
  const user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    updateData: {
      isDeleted:true, 
      deletedAt: new Date(),
     }, // 🔥 Set deletion timestamp
  });

  if (!user) {
    return next(new Error("❌ User not found!"  ,{cause:404}));
  }

  return successResponse({
    res,
    message: "✅ User soft deleted successfully.",
  });
});
//-10-✅ 🔄 Restore user profile Request
export const restoreProfileRequest = asyncHandler(async (req, res, next) => {
  const{email}=req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter:{
      email,
      isDeleted:true, 
    }
  });

  if (!user) {
    return next(new Error("❌ User not found!"  ,{cause:404}));
  }


  if (!user.canRestore()) {
    //🔹 403 Forbidden 
    return next(new Error("⏳ Restore period expired! Account cannot be restored after 1 year."   ,{cause:403}));
  }

  
  emailEvent.emit("restoreAccountOtp", {
    id: user._id,
    userName: user.userName,
    email,
  });

  return successResponse({
    res,
    message: "✅ User restored request  successfully check email.",
    status:410  //🔹 410 Gone → Use if the account is permanently deleted.
  });
});
//-11-✅ 🔄 Restore user profile
export const restoreProfileAccount = asyncHandler(async (req, res, next) => {
  const{email,otpCode}=req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter:{
      email,
      isDeleted:true, 
    }
  });

  if (!user) {
    return next(new Error("❌ User not found!"  ,{cause:404}));
  }


  if (!user.canRestore()) {
    //🔹 403 Forbidden 
    return next(new Error("⏳ Restore period expired! Account cannot be restored after 1 year."   ,{cause:403}));
  }

  // check from otp

  const otpIndex = user.OTP.findIndex((entry) => entry.type === subjectTypes.restoreAccount);
    if (otpIndex === -1) return res.status(400).json({ message: "No OTP found." });

    const otpEntry = user.OTP[otpIndex];
  //IF MATCHED OTP check if otp expired or not 
  if (otpEntry.expiresIn.getTime() < Date.now()) {
    await dbService.updateOne({
      model: userModel,
      filter: { email },
      updateData: {
        otpTrialCount: 0,
        $pull: { OTP: { type: subjectTypes.restoreAccount } },
      },
    });
    return next(new Error("OTP expired RESEND IT", { cause: 400 }));
  }
  //check if codeOtp is valid if not valid  count 5 time if also not match generate timeout to can resend otp
  if (!compareHash(otpCode, otpEntry.code)) {
    user.otpTrialCount++;
    await user.save();
    // trial by otp not exceed than 5
    if (user.otpTrialCount > 5) {
    
      await dbService.updateOne({
        model: userModel,
        filter: { email },
        updateData: {
          regenerateOtpTime:
            Date.now() + Number(process.env.TIMERESENDOTP) * 60 * 1000,
            $pull: { OTP: { type: subjectTypes.restoreAccount } },
        },
      });
      return next(
        new Error(`OTP expired regenerated otp after ${process.env.TIMERESENDOTP} minutes`, { cause: 400 })
      );
    }
    return next(new Error("Invalid codeOtp", { cause: 400 }));
  }


  await dbService.findOneAndUpdate({
    model: userModel,
    filter:{
      email,
      isDeleted:true, 
    },
    updateData: { 
      $unset:{
        isDeleted:0,
        deletedAt: null,
      },
      $pull: { OTP: { type: subjectTypes.restoreAccount } },

     }, // 🔄 Restore account
  });

  return successResponse({
    res,
    message: "✅ User restored successfully.",
    status:410  //🔹 410 Gone → Use if the account is permanently deleted.
  });
});



//-*- ✅ 🔥 Extra end point

//==============================================================================
export const sendFriendRequest = asyncHandler(async (req, res, next) => {
  const { friendId } = req.params;
  
  
  const checkUser = await dbService.findOne({
    model: userModel,
    filter: { _id: friendId,isDeleted: false },
    
  });
  if (!checkUser) {
    return next(new Error("In-Valid Account Id", { cause: 404 }));
  }
  const friendRequest = await dbService.create({
    model: friendRequestModel,
    data: {
      friendId,
      createdBy: req.user._id,
    },

  })

  return successResponse({
    res,
    status: 201,
    message: "done",
    data:{friendRequest}
  });
});
export const acceptFriendRequest = asyncHandler(async (req, res, next) => {
  const { friendRequestId } = req.params;
  
  

  const friendRequest = await dbService.findOneAndDelete({
    model: friendRequestModel,
    data: {
      _id: friendRequestId,
      status: "pending",
      friendId: req.user._id,
    },
  });
  if (!friendRequest) {
    return next(new Error("In-Valid Request Id", { cause: 404 }));
  };
  await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: friendRequest.createdBy,isDeleted: false },
    updateData: {
      $addToSet: {
        friends: req.user._id,   
      },
    },
  });
  await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id},
    updateData: {
      $addToSet: {
        friends: friendRequest.createdBy,   
      },
    },
  });

  return successResponse({
    res,
    status: 200,
    message: "done",
    data:{}
  });
});
//===============================================================================
export const dashboard = asyncHandler(async (req, res, next) => {
  
  const data = await Promise.allSettled([
    dbService.findAll({
      model: userModel,
      filter: {},
    }),
    dbService.findAll({
      model: postModel,
      filter: {},
    }),
  ]);

  return successResponse({
    res,
    message: "",
    data: { users: data[0], posts:data[1]},
  });
});

export const updateEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (await dbService.findOne({ model: userModel, filter: { email } })) {
    return next(new Error("this email exist", { cause: 409 }));
  }
  await dbService.updateOne({
    model: userModel,
    filter: { _id: req.user._id },
    updateData: { tempEmail: email },
  });
  //send otp to new email
  emailEvent.emit("sendUpdateEmailOtp", {
    id: req.user._id,
    userName: req.user.userName,
    email,
  });
  //send otp to native email
  emailEvent.emit("sendConfirmEmailOtp", {
    id: req.user._id,
    userName: req.user.userName,
    email: req.user.email,
  });

  return successResponse({
    res,
    message: "Email updated request done verify your email otp and new email otp",
    data: {},
  });
});

export const replaceEmail = asyncHandler(async (req, res, next) => {
  const { oldEmailCode, newEmailCode } = req.body;
  if (await dbService.findOne({model: userModel,filter: { email: req.user.tempEmail }})) {
    return next(new Error("this email exist", { cause: 409 }));
  }

  const otpEntryOld = req.user.OTP.find((entry) => entry.type === subjectTypes.confirmEmail);
    if (!otpEntryOld) {
      return next(new Error("No OTP for confirm old Email found.", { cause: 400 }));
    };
    
    const otpEntryNew = req.user.OTP.find((entry) => entry.type === subjectTypes.updateEmail);
    if (!otpEntryNew) {
      return next(new Error("No OTP for confirm new Email found.", { cause: 400 }));
    };
 


  if (!compareHash(oldEmailCode, otpEntryOld.code)) {
    return next(
      new Error("invalid oldEmailOtp you must provide verification code", {
        cause: 400,
      })
    );
  }
  if (!compareHash(newEmailCode, otpEntryNew.code)) {
    return next(
      new Error("invalid newEmailOtp you must provide verification code", {
        cause: 400,
      })
    );
  }

  await dbService.updateOne({
    model: userModel,
    filter: { _id: req.user._id },
    updateData: {
      email: req.user.tempEmail,
      changeCredentialTime: Date.now(),
      $unset: {
        tempEmail: 0,
      },
      $pull: { OTP: { type: subjectTypes.confirmEmail } },
      $pull: { OTP: { type: subjectTypes.updateEmail } },
    },
  });

  return successResponse({
    res,
    message: "Email Replaced successfully and you can login with your new email",
    data: {},
  });
});


export const changePrivileges = asyncHandler(async (req, res, next) => {
  const { userId, role } = req.body

  //only superAdmin can change privileges and admin can't change admin but change user
  const owner = req.user.role === roleTypes.superAdmin ? {} : {
    role: {
  $nin:[roleTypes.admin]
}}

  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: { _id: userId, isDeleted: { $exists: false },...owner },
    updateData: {
      role,
      modifiedBy:req.user._id,
    },
  });

  return successResponse({
    res,
    message: "done",
    data: user,
  });
});
