
import { decodedToken } from "../utils/security/token/token.js";
import { asyncHandler } from "../utils/response/error/error.handling.js";


export const authentication = () => { 
  return asyncHandler(async (req, res, next) => {
    req.user = await decodedToken({
      authorization: req.headers.authorization,
      next,
    });
    return next();
  });
};

export const authorization = (accessRole = []) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRole.includes(req.user.role)) {
      return next(new Error("Access denied not authorized", { cause: 403 }));
    }
    return next();
  });
};
