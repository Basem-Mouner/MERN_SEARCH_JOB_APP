import userModel from "../../../DB/model/user.model.js";
import { emailEvent } from "../../../utils/events/sendEmail.event.js";
import { asyncHandler } from "../../../utils/response/error/error.handling.js";
import { successResponse } from "../../../utils/response/success.response.js";
import { verifyToken } from "../../../utils/security/token/token.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import { generateEncryption } from "../../../utils/security/encryption.js";
import * as dbService from "../../../DB/db.services.js";


import { subjectTypes } from "../../../middleWare/types/subjectTypes.js";


export const signup = asyncHandler(async (req, res, next) => {
  const {
    userName,
    email,
    password,
    gender,
    confirmationPassword,
    mobileNumber,
    role,
    DOB
  } = req.body;

  //check password and  confirmationPassword not need for this step because validation don't
  if (password != confirmationPassword) {
    return next(new Error("Passwords do not match", { cause: 400 }));
  }
  //check if user already exists generate new next error
  if (await userModel.findOne({ email })) {
    return next(new Error("Email already exists", { cause: 409 }));
  }

 
  // const user = await dbService.create({
  //   model: userModel,
  //   data: {
  //   userName,
  //   email,
  //   password: generateHash(password), //default round in function is 7 in env salt=parseInt(process.env.SALT_ROUND)
  //   gender,
  //   role,
  //   mobileNumber,
  //   DOB
  //   // phone: generateEncryption(phone), //default signature process.env.ENCRYPTION_SIGNATURE
  // }
  //  });
  const user=new userModel( {
      userName,
      email,
      password,
      gender,
      role,
      mobileNumber,
      DOB
    }
  )
   await user.save()
  // event send email for confirmation this email in signup
  emailEvent.emit("sendConfirmEmailOtp", {id:user._id, userName, email });
  return successResponse({
    res,
    message: "Done create new account successfully ",
    data: { user },
    status: 201,
  });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, codeOtp } = req.body;
  
  const user = await dbService.findOne({
    model: userModel,
    filter: { email },
});

  //check if user already exists generate new next error
  if (!user) {
    return next(new Error("Email not found", { cause: 404 }));
  }
  //check if email confirmed or not
  if (user.confirmEmail) {
    return next(new Error("Email Already confirmed go  to login", { cause: 409 }));
  }

  const otpIndex = user.OTP.findIndex((entry) => entry.type === subjectTypes.confirmEmail);
    if (otpIndex === -1) return res.status(400).json({ message: "No OTP found." });

    const otpEntry = user.OTP[otpIndex];
  //IF MATCHED OTP check if otp expired or not 
  if (otpEntry.expiresIn.getTime() < Date.now()) {
    await dbService.updateOne({
      model: userModel,
      filter: { email },
      updateData: {
        otpTrialCount: 0,
        $pull: { OTP: { type: subjectTypes.confirmEmail } },
      },
    });
    return next(new Error("OTP expired RESEND IT", { cause: 400 }));
  }
  //check if codeOtp is valid if not valid  count 5 time if also not match generate timeout to can resend otp
  if (!compareHash(codeOtp, otpEntry.code)) {
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
            $pull: { OTP: { type: subjectTypes.confirmEmail } },
        },
      });
      return next(
        new Error(`OTP expired regenerated otp after ${process.env.TIMERESENDOTP} minutes`, { cause: 400 })
      );
    }
    return next(new Error("Invalid codeOtp", { cause: 400 }));
  }



  //update confirmEmail for user
  await dbService.findOneAndUpdate({
    model: userModel,
    filter: { email },
    updateData: {
      confirmEmail: true,
      $pull: { OTP: { type: subjectTypes.confirmEmail } },
      $unset: {       
        otpTrialCount: 0,    
        // regenerateOtpTime: 0
      },
     
    },
  });
  

  return successResponse({
    res,
    message: "Done email confirmed ",
    status: 200,
  });
});

export const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: { email },
  });
  //check if user already exists generate new next error
  if (!user) {
    return next(new Error("Email not found", { cause: 404 }));
  }
  //check if email confirmed or not
  // if (user.confirmEmail) {
  //   return next(new Error("Email Already confirmed", { cause: 409 }));
  // }

   if (user.otpTrialCount > 5) {
     //await 5 min to generate code
     if (user.regenerateOtpTime.getTime() > Date.now()) { 
       return next(new Error(" regenerated otp after 5 minutes", { cause: 400 }))
     }
     
      await dbService.updateOne({
        model: userModel,
        filter: { email },
        updateData: {
          otpTrialCount: 0,
          $unset: { regenerateOtpTime: 0 },
        },
      });

    }

  // event send email for confirmation this email in signup
  emailEvent.emit("sendConfirmEmailOtp", {
    id: user._id,
    userName: user.userName,
    email,
  });

  return successResponse({
    res,
    message: "Done resend otp check your mail ",
    status: 200,
  });
});



