import userModel from "../DB/model/user.model.js";
import { decodedToken, verifyToken } from "../utils/security/token/token.js";
import { asyncHandler } from "../utils/response/error/error.handling.js";
import { roleTypes } from "./types/roleTypes.js";
import * as dbService from "../DB/db.services.js";
import { tokenTypes } from "./types/tokenTypes.js";



export const authentication_Graph = async({authorization,tokenType=tokenTypes.access}={}) => {


    const [Bearer, token] = authorization?.split(" ") || [];
    if (!Bearer || !token) {
      throw new Error("Unauthorized authorization required  or in-valid formatted") 
      
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
        break;
    }
    
   
    const decodeToken = verifyToken({
      token,
      signature:
        tokenType == tokenTypes.access ? accessSignature : refreshSignature,
    });

    if (!decodeToken?.userId) {
      throw new Error("IN-Valid token payload")
    }

    const user = await dbService.findById({
      model: userModel,
      id: decodeToken.userId,
    });

    if (!user) {
      throw new Error("User not found" )
    }

    //when changed password token will expired  iat--->initiated at inside token
    if (parseInt((user.changeCredentialTime?.getTime()||0)/ 1000) >= decodeToken.iat) {
      throw new Error("Expired credential Password changed, please login again with new password")
    }

     //when account are frizzing and send redirection email to reconfirm your account
    // if ((parseInt((user.lastFrizzTime?.getTime() || 0) / 1000) >= decodeToken.iat) || (user.frizz == true)) {
    //   return next(new Error("Account is frizzing, please reactivated your account via email", {cause: 400,
    //   }))
    // }
    return user;
  };


export const authorization_Graph = ({accessRole = [],role}={}) => {
    if (!accessRole.includes(role)) {
      throw new Error("Access denied not authorized") ;
    }
    return true;
};
