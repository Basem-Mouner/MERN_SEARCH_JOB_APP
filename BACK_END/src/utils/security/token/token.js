import jwt from "jsonwebtoken"
import { tokenTypes } from "../../../middleWare/types/tokenTypes.js";
import * as dbService from "../../../DB/db.services.js";
import userModel from "../../../DB/model/user.model.js";
import { roleTypes } from "../../../middleWare/types/roleTypes.js";



export const generateToken = ({
  payload = {},
  signature,
  options = { expiresIn: process.env.EXPIRESIN },
} = {}) => {
  const token = jwt.sign(payload, signature, options);
  return token;
};

export const verifyToken = ({ token={}, signature } = {}) => {
  const decodedToken = jwt.verify(token, signature);
  return decodedToken;
};


export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypes.access,
  next
} = {}) => {
 

  const [Bearer, token] = authorization?.split(" ") || [];
  if (!Bearer || !token) {
    return next(
      new Error("Unauthorized authorization required", { cause: 400 })
    );
  }
  let accessSignature = "";
  let refreshSignature = "";

  switch (Bearer) {
    case roleTypes.admin:
      accessSignature = process.env.TOKEN_SIGNATURE_Admin;
      refreshSignature = process.env.TOKEN_REFRESH_SIGNATURE_Admin;
      break;
    case roleTypes.user:
      accessSignature = process.env.TOKEN_SIGNATURE_User;
      refreshSignature = process.env.TOKEN_REFRESH_SIGNATURE_User;
      break;

    default:
      accessSignature = process.env.TOKEN_SIGNATURE_User;
      refreshSignature = process.env.TOKEN_REFRESH_SIGNATURE_User;
      break;
  }
  
 
  const decodeToken = verifyToken({
    token,
    signature:
      tokenType == tokenTypes.access ? accessSignature : refreshSignature,
  });

  if (!decodeToken?.userId) {
    return next(new Error("IN-Valid token payload", { cause: 400 }));
  }

  const user = await dbService.findOne({
    model: userModel,
    filter: {
      _id: decodeToken.userId,
      isDeleted: { $exists: false },
      bannedAt: { $exists: false },
    },
  });

  if (!user) {
    return next(new Error("User not found or may be banned", { cause: 404 }));
  }

  //when changed password token will expired  iat--->initiated at inside token
  if (
    parseInt((user.changeCredentialTime?.getTime() || 0) / 1000) >=
    decodeToken.iat
  ) {
    return next(
      new Error(
        "in-valid credentials ", //Password changed, please login again with new password
        { cause: 400 }
      )
    );
  }

  return user;
};