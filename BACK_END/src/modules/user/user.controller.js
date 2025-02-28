import { Router } from "express";
const router = Router();
//-----------------------------------------------------------------------------
import * as userProfileServices from "./service/profile.service.js";
import * as validators from "./user.validation.js";
import { endPoint } from "./user.endpoint.js";
import { authentication, authorization } from "../../middleWare/auth.middleware.js";
import { validation } from "../../middleWare/validation.middleware.js";
import { uploadDiskFile } from "../../utils/multer/local.multer.js";
import { fileValidationTypes } from "../../middleWare/types/fileValidationTypes.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
//-------------------------------------------------------------------------------
//-2-✅
router.get("/profile", authentication(), authorization(endPoint.profile), userProfileServices.userProfile);
//-------------------------------------------------------------------------------
//-extra ✅
router.get("/profile/admin/dashboard",
  authentication(),
  authorization(endPoint.admin),
  userProfileServices.dashboard
);
//-------------------------------------------------------------------------------
//-1-✅ user Profile Update
router.patch("/profile",validation(validators.updateProfile),authentication(),authorization(endPoint.profile), userProfileServices.userProfileUpdate);
//-------------------------------------------------------------------------------
//-4- 💪 Update password✅
router.patch("/profile/password", validation(validators.updatePassword), authentication(), authorization(endPoint.profile), userProfileServices.passwordUpdate);
//--📌--extra ✅ updateEmail
router.patch("/profile/updateEmail",
  validation(validators.updateEmail),
  authentication(),
  authorization(endPoint.profile),
  userProfileServices.updateEmail
);
//--📌--extra ✅ replaceEmail
router.patch("/profile/replaceEmail",
  validation(validators.replaceEmail),
  authentication(),
  authorization(endPoint.profile),
  userProfileServices.replaceEmail
);
//========================================================================================
router.patch("/profile/addFriendRequest/:friendId",
  authentication(),
  userProfileServices.sendFriendRequest
);
router.patch("/profile/acceptFriendRequest/:friendRequestId",
  authentication(),
  userProfileServices.acceptFriendRequest
);
//___________________cloudinary and upload files_____________________
//-5-✅
router.patch("/profile/image",
  authentication(),
  authorization(endPoint.profile),
  // uploadDiskFile({
  //   destinationFolder: "users",
  //   fileValidation: fileValidationTypes.image,
  //   filePrefix: "image_1",
  // }).single("image"),
  uploadCloudFile({
    fileValidation: fileValidationTypes.image,
  }).single("image"),
  userProfileServices.updateImageProfile
);
//-6-✅
router.delete("/profile/image",
  authentication(),
  authorization(endPoint.profile),
  userProfileServices.deleteImageProfile 
);
//-7-✅
router.patch("/profile/image/cover",
  authentication(),
  authorization(endPoint.profile),
  // uploadDiskFile({
  //   destinationFolder: "users/cover",
  //   fileValidation: fileValidationTypes.image,
  //   filePrefix: "imageCover_1",
  // }).array("image",5),
  uploadCloudFile({
    fileValidation: fileValidationTypes.image,
  }).array("image",3),
  userProfileServices.updateImageCover
);
//-8-✅
router.delete("/profile/image/cover",
  authentication(),
  authorization(endPoint.profile),
  validation(validators.deleteCoverImage),
  userProfileServices.deleteCoverImage
);


//-3-✅
router.get("/profile/:profileId",validation(validators.shareProfile),authentication(), userProfileServices.shareUserProfile);
//-9-✅ // 🔥 Soft delete user
router.delete("/deleteProfile", authentication(), userProfileServices.softDeleteUser); // 🔥 Soft delete user
//-10-✅ 🔄 Restore user
router.put("/restoreProfileRequest",validation(validators.restoreProfileRequest), userProfileServices.restoreProfileRequest); // 🔄 Restore user
router.put("/restoreProfileAccount",validation(validators.restoreProfileAccount), userProfileServices.restoreProfileAccount); // 🔄 Restore user
//________________________________
export default router;
