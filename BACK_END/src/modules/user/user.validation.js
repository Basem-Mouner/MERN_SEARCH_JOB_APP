import Joi from "joi";
import { generalFields } from "../../middleWare/validation.middleware.js";

export const updateProfile = Joi.object()
  .keys({
    userName: generalFields.userName,
    firstName:generalFields.userName,
    lastName:generalFields.userName,
    mobileNumber: generalFields.phone,
    gender: generalFields.gender,
    DOB: generalFields.DOB,
  })
  .options({
    allowUnknown: false, //very dangerous at assign true be carful
  })
  .required();

export const updatePassword = Joi.object()
  .keys({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(Joi.ref("oldPassword")).required(),
    confirmationPassword: generalFields.confirmationPassword
      .valid(Joi.ref("password"))
      .required(),
  })
  .options({
    allowUnknown: false, //very dangerous at assign true be carful
  })
  .required();

  export const updateEmail = Joi.object()
    .keys({
      email: generalFields.email.required(),
      
        
    })
    .options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
  .required();
    export const replaceEmail = Joi.object()
      .keys({
        oldEmailCode: generalFields.codeOtp.required(),
        newEmailCode: generalFields.codeOtp.required()
      })
      .options({
        allowUnknown: false, //very dangerous at assign true be carful
      })
      .required();

 

  export const shareProfile = Joi.object()
    .keys({
      profileId: generalFields.id.required(),
    })
    .options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();
    export const deleteCoverImage = Joi.object()
    .keys({
      public_id : Joi.string().required(),
    })
    .options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();


    export const restoreProfileRequest = Joi.object()
    .keys({
      email: generalFields.email.required(),
    })
    .options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();
    export const restoreProfileAccount = Joi.object()
    .keys({
      email: generalFields.email.required(),
      otpCode:generalFields.codeOtp.required(),
    })
    .options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();


    export const newRoom = Joi.object()
    .keys({
      name: Joi.string().required(),
    })
    .options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();

    export const deleteRoom = Joi.object()
    .keys({
      roomId: generalFields.id.required(),
    })
    .options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();

    export const roomChat = Joi.object()
    .keys({
      roomId: generalFields.id.required(),
      acceptLanguage: generalFields.acceptLanguage, 
    })
    .options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();

    export const addUserToRoom = Joi.object()
    .keys({
      roomId: generalFields.id.required(),
      userId: generalFields.id.required(),
    })
    .options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();


    export const ApproveCompanyGraph = Joi.object().keys({
      companyId: generalFields.id.required(),
      authorization: Joi.string().required(),
    }).options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();
    
    export const banCompanyGraph = Joi.object().keys({
      companyId: generalFields.id.required(),
      authorization: Joi.string().required(),
    }).options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();

    

    export const banUserGraph = Joi.object().keys({
      userId: generalFields.id.required(),
      authorization: Joi.string().required(),
    }).options({
      allowUnknown: false, //very dangerous at assign true be carful
    })
    .required();