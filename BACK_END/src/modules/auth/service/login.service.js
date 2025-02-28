import userModel from "../../../DB/model/user.model.js";
import { roleTypes } from "../../../middleWare/types/roleTypes.js";
import { asyncHandler } from "../../../utils/response/error/error.handling.js";
import { successResponse } from "../../../utils/response/success.response.js";
import {
  decodedToken,
  generateToken,
  verifyToken,
} from "../../../utils/security/token/token.js";
import { compareHash, generateHash } from "../../../utils/security/hash.js";
import { emailEvent } from "../../../utils/events/sendEmail.event.js";

import { OAuth2Client } from "google-auth-library";
import { providerTypes } from "../../../middleWare/types/providerTypes.js";
import jwt from "jsonwebtoken"; // for decoding the id_token
import * as dbService from "../../../DB/db.services.js";
import { tokenTypes } from "../../../middleWare/types/tokenTypes.js";
import { subjectTypes } from "../../../middleWare/types/subjectTypes.js";

//________________________ login _____________________________
export const login = asyncHandler(async (req, res, next) => {
  const { email, mobileNumber, password } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: {
       $or: [{ email }, { mobileNumber }] ,
       isDeleted:{$exists:false}
      },
  });

  if (!user) {
    return next(new Error("In-Valid Account", { cause: 404 }));
  }

  if (!user.confirmEmail) {
    return next(new Error("Please confirm your email first", { cause: 404 }));
  }
  //this because if user normal login not login with gmail
  if (user.provider != providerTypes.system) {
    return next(new Error("in-valid provider", { cause: 404 }));
  }

  if (!compareHash(password, user.password)) {
    return next(new Error("Invalid Password", { cause: 401 }));
  }
  //check if user hire  2_step verification .... Generate OTP and send via email
  if (user.twoStepVerificationFlag) {
    //send otpCode to second step verification
    // delete old code 
    const otpIndex = user.OTP.findIndex((entry) => entry.type === subjectTypes.twoStepVerification);
    if (otpIndex !== -1) {
      user.OTP.splice(otpIndex, 1);
      await user.save();
    }
    emailEvent.emit("send2StepVerificationOtp", {
      id: user._id,
      userName: user.userName,
      email,
    });
    return successResponse({
      res,
      message: "OTP sent to your email for login verification.",
      data: {},
      status: 200,
    });
  }
  //________________
  // If 2-step verification is not enabled, login directly after generate token
  const accessToken = generateToken({
    payload: { userId: user._id },
    signature:
      user.role == roleTypes.admin
        ? process.env.TOKEN_SIGNATURE_Admin
        : process.env.TOKEN_SIGNATURE_User, //pathAlgorithm,
    options: { expiresIn: "1h" },
  });
  const refreshToken = generateToken({
    payload: { userId: user._id },
    signature:
      user.role == roleTypes.admin
        ? process.env.TOKEN_REFRESH_SIGNATURE_Admin
        : process.env.TOKEN_REFRESH_SIGNATURE_User, //pathAlgorithm,
    options: { expiresIn: "7d" }, //after 7 DAY
  });
  //___________________

  return successResponse({
    res,
    message: "done login",
    data: { accessToken, refreshToken },
    status: 200,
  });
});
//________________________activate and login with 2 step verification _____________________________
export const enable_2step = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const {action} =req.params;
  const updateData=action==="enable"? {
    twoStepVerificationFlag: true,
  }: {
    $unset:{twoStepVerificationFlag: 0},
  }

  const message=action==="enable"? "Enable Two step Verification ": "disable Two step Verification "

  const user = await dbService.findOne({
    model: userModel,
    filter: { email },
  });

  if (!user) {
    return next(new Error("In-Valid Account", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Please confirm your email first", { cause: 404 }));
  }
  //this because if user normal login not login with gmail
  if (user.provider != providerTypes.system) {
    return next(new Error("in-valid provider", { cause: 404 }));
  }

  // Clear OTP fields after successful verification
  await dbService.updateOne({
    model: userModel,
    filter: { email },
    updateData,
  });

  return successResponse({
    res,
    message,
    data: {},
    status: 200,
  });
});

export const confirm_login = asyncHandler(async (req, res, next) => {
  const { email, otpCode } = req.body;

  const user = await dbService.findOne({
    model: userModel,
    filter: { email },
  });

  if (!user) {
    return next(new Error("In-Valid Account", { cause: 404 }));
  }
  if (!user.confirmEmail) {
    return next(new Error("Please confirm your email first", { cause: 404 }));
  }
  if (!user.twoStepVerificationFlag) {
    return next(
      new Error("you must choose to login with two step verification first", {
        cause: 404,
      })
    );
  }
  //this because if user normal login not login with gmail
  if (user.provider != providerTypes.system) {
    return next(new Error("in-valid provider", { cause: 404 }));
  }
 
  
  const otpIndex = user.OTP.findIndex((entry) => entry.type === subjectTypes.twoStepVerification);
    if (otpIndex === -1) return res.status(400).json({ message: "No OTP found." });

    const otpEntry = user.OTP[otpIndex];
    
  if (!compareHash(otpCode,otpEntry.code)) {
    return next(
      new Error("Invalid 2-Step Verification Otp code", { cause: 401 })
    );
  }
  
  if (otpEntry.expiresIn.getTime() < Date.now()) {
    return next(
      new Error("Two step verification code expired", { cause: 404 })
    );
  }

  // Clear OTP fields after successful verification
  await dbService.updateOne({
    model: userModel,
    filter: { email },
    updateData: {
      $pull: { OTP: { type: subjectTypes.twoStepVerification } },
    },
  });

  //________________

  const accessToken = generateToken({
    payload: { userId: user._id },
    signature:
      user.role == roleTypes.admin
        ? process.env.TOKEN_SIGNATURE_Admin
        : process.env.TOKEN_SIGNATURE_User, //pathAlgorithm,
    options: { expiresIn: "1h" },
  });
  const refreshToken = generateToken({
    payload: { userId: user._id },
    signature:
      user.role == roleTypes.admin
        ? process.env.TOKEN_REFRESH_SIGNATURE_Admin
        : process.env.TOKEN_REFRESH_SIGNATURE_User, //pathAlgorithm,
    options: { expiresIn: "7d" }, //after 7d
  });
  //___________________

  return successResponse({
    res,
    message: "success two step verification login ",
    data: { accessToken, refreshToken },
    status: 200,
  });
});
//_____________________________________________________________________________________

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  
  
  // check if email exist in DB
  const user =await dbService.findOne({
    model: userModel,
    filter: {
       email,
       isDeleted: { $exists: false }
       },
  });

  if (!user) {
    return next(new Error("email not found", { cause: 400 }));
  }

  const otpIndex = user.OTP.findIndex((entry) => entry.type === subjectTypes.resetPassword);
  if (otpIndex !== -1) {
    user.OTP.splice(otpIndex, 1);
    await user.save();
  }
  
  
  //generate otp
  emailEvent.emit("sendForgetPasswordOtp", {
    id: user._id,
    userName: user.userName,
    email,
  });

  return successResponse({
    res,
    message:
      " sending otp code check for your email and then reset your password",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, password, codeOtp } = req.body;
  // check if email exist in DB

  const user =await dbService.findOne({
    model: userModel,
    filter: { email, isDeleted: { $exists: false }},
  });

  if (!user) {
    return next(new Error("email not found", { cause: 400 }));
  }
  const otpIndex = user.OTP.findIndex((entry) => entry.type === subjectTypes.resetPassword);
    if (otpIndex === -1) return res.status(400).json({ message: "No OTP found." });

    const otpEntry = user.OTP[otpIndex];

  if (!compareHash(codeOtp, otpEntry.code)) {
    return next(new Error("invalid otp reset code", { cause: 400 }));
  }
  if (otpEntry.expiresIn.getTime() < Date.now()) {
    return next(new Error("OTP expired", { cause: 400 }));
  }

  await dbService.findOneAndUpdate({
    model: userModel,
    filter: { email, isDeleted: { $exists: false } },
    updateData: {
      password: generateHash(password),
      changeCredentialTime: Date.now(),
      confirmEmail: true,
      $pull: { OTP: { type: subjectTypes.resetPassword } },
    },
  });

  return successResponse({
    res,
    message: " password reset successfully you can login now by new password",
  });
});

export const refreshToken = asyncHandler(async (req, res, next) => {
 
  const user = await decodedToken({
    authorization: req.headers.authorization,
    tokenType: tokenTypes.refresh,
  });

  const accessToken = generateToken({
    payload: { userId: user._id },
    signature:
      user.role == roleTypes.admin
        ? process.env.TOKEN_SIGNATURE_Admin
        : process.env.TOKEN_SIGNATURE_User, //pathAlgorithm,
    options: { expiresIn: "1h" },
  });
  const refreshToken = generateToken({
    payload: { userId: user._id },
    signature:
      user.role == roleTypes.admin
        ? process.env.TOKEN_REFRESH_SIGNATURE_Admin
        : process.env.TOKEN_REFRESH_SIGNATURE_User, //pathAlgorithm,
    options: { expiresIn: "7d" }, //after 7d
  });
  //___________________

  return successResponse({
    res,
    message: "done login",
    data: { accessToken, refreshToken },
    status: 200,
  });
});

//*****************************login by gmail google ***************************************
export const loginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload);
    return payload;
  }
  const payload = await verify();

  if (!payload?.email_verified) {
    return next(new Error("email not verified", { cause: 404 }));
  }

  // Find user by email
  let user = await dbService.findOne({
    model: userModel,
    filter: { email: payload?.email },
  });

  // // if user and google provider  go login direct but if system
  if (user?.provider === providerTypes.system) {
    return next(new Error("in-valid login provider user already login by system", { cause: 409 }));
  }
  if (!user) {
    user = await dbService.create({
      model: userModel,
      data: {
        userName: payload?.name,
        email: payload?.email,
        provider: providerTypes.google,
        confirmEmail: payload?.email_verified,
        profilePic: {secure_url: payload?.picture},
      },
    });
  }

  //________________

  const accessToken = generateToken({
    payload: { userId: user?._id },
    signature:
      user.role == roleTypes.admin
        ? process.env.TOKEN_SIGNATURE_Admin
        : process.env.TOKEN_SIGNATURE_User, //pathAlgorithm,
    options: { expiresIn: "1h" },
  });
  const refreshToken = generateToken({
    payload: { userId: user?._id },
    signature:
      user.role == roleTypes.admin
        ? process.env.TOKEN_REFRESH_SIGNATURE_Admin
        : process.env.TOKEN_REFRESH_SIGNATURE_User, //pathAlgorithm,
    options: { expiresIn: "7d" }, //after 1 year
  });
  return successResponse({
    res,
    message: "done login",
    // data: { idToken, profile, accessToken, refreshToken },
    data: { accessToken, refreshToken },
    status: 200,
  });
});
//***********************************************************************************
