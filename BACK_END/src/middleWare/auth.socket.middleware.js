import userModel, { socketConnections } from "../DB/model/user.model.js";
import { decodedToken, verifyToken } from "../utils/security/token/token.js";
import { roleTypes } from "./types/roleTypes.js";
import * as dbService from "../DB/db.services.js";
import { tokenTypes } from "./types/tokenTypes.js";



export const authenticationSocket = async({socket={},tokenType=tokenTypes.access}) => {


    const [Bearer, token] = socket?.handshake?.auth?.authorization?.split(" ") || [];
    if (!Bearer || !token) {
    return {data:{message:"Unauthorized authorization required  or in-valid formatted",statues:400}}
   
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
  
      default:accessSignature = process.env.TOKEN_SIGNATURE_User;
        refreshSignature = process.env.TOKEN_REFRESH_SIGNATURE_User;
        break;
    }
    
   
    const decodeToken = verifyToken({
      token,
      signature:
        tokenType == tokenTypes.access ? accessSignature : refreshSignature,
    });

    if (!decodeToken?.userId) {
      return {data:{message:"IN-Valid token payload",statues:401}}
      
    }

    const user = await dbService.findById({
      model: userModel,
      id: decodeToken.userId,
    });

    if (!user) {
      return {data:{message:"User not found",statues:401}}
    }

    //when changed password token will expired  iat--->initiated at inside token
    if (parseInt((user.changeCredentialTime?.getTime()||0)/ 1000) >= decodeToken.iat) {
      return {data:{message:"Expired credential Password changed, please login again with new password",statues:400}}
      
    }

     //when account are frizzing and send redirection email to reconfirm your account
    // if ((parseInt((user.lastFrizzTime?.getTime() || 0) / 1000) >= decodeToken.iat) || (user.frizz == true)) {
    //   return next(new Error("Account is frizzing, please reactivated your account via email", {cause: 400,
    //   }))
    // }

    return {data:{user,valid:true}};
  };


export const authorizationSocket = ({accessRole = [],role}={}) => {
    if (!accessRole.includes(role)) {
      throw new Error("Access denied not authorized") ;
    }
    return true;
};
