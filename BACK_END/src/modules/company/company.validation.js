
import Joi from "joi";
import { generalFields } from "../../middleWare/validation.middleware.js";



export const createCompany = Joi.object().keys({
  companyName:generalFields.companyName.required(),
  companyEmail:generalFields.email.required(),
  description:Joi.string().min(2).max(20000),
  industry:Joi.string(),
  numberOfEmployees:Joi.array().items(Joi.number()).length(2),
  address:Joi.string().min(2).max(20000),
}).options({
  allowUnknown: false, //very dangerous at assign true be carful
})
.required();

export const updateCompany = Joi.object().keys({
  companyName:generalFields.companyName,
  companyEmail:generalFields.email,
  description:Joi.string().min(2).max(20000),
  industry:Joi.string(),
  numberOfEmployees:Joi.array().items(Joi.number()).length(2),
  address:Joi.string().min(2).max(20000),
}).options({
  allowUnknown: false, //very dangerous at assign true be carful
})
.required();


export const deleteCompany = Joi.object()
.keys({
  companyId:generalFields.id.required(),
})
.options({
  allowUnknown: false, //very dangerous at assign true be carful
})
.required();
export const searchCompany = Joi.object()
  .keys({
    companyName:generalFields.companyName.required()
  })
  .options({
    allowUnknown: false, //very dangerous at assign true be carful
  })
  .required();
  
  export const getCompany = Joi.object()
  .keys({
    companyId:generalFields.id.required(),
    acceptLanguage: generalFields.acceptLanguage,
  })
  .options({
    allowUnknown: false, //very dangerous at assign true be carful
  })
  .required();
  export const updateLogo = Joi.object()
  .keys({
    companyId:generalFields.id.required(),
  })
  .options({
    allowUnknown: false, //very dangerous at assign true be carful
  })
  .required();


  export const updateCoverPic = Joi.object()
  .keys({
    companyId:generalFields.id.required(),
  })
  .options({
    allowUnknown: false, //very dangerous at assign true be carful
  })
  .required();

  export const pushHRs = Joi.object().keys({
    companyId:generalFields.id.required(),
    hrId:generalFields.id.required(),
  }) .options({
    allowUnknown: false, //very dangerous at assign true be carful
  })
  .required();
  export const exportJobApplications = Joi.object().keys({
    companyId:generalFields.id.required(),
    date:Joi.date().required(),
    
  }).options({
    allowUnknown: false, //very dangerous at assign true be carful
  })
  .required();