import Joi from "joi";
import { genderTypes } from "./types/genderTypes.js";
import { roleTypes } from "./types/roleTypes.js";
import { Types } from "mongoose";
import { jobTypes } from "./types/jobTypes.js";
import { workingTimeTypes } from "./types/workingTimeTypes.js";
import { seniorityLevelTypes } from "./types/seniorityLevelTypes.js";
import { applicationStatusTypes } from "./types/applicationStatusTypes.js";

export const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("invalid object id");
};
export const fileObject = {
  fieldname: Joi.string(),
  originalname: Joi.string(),
  encoding: Joi.string(),
  mimetype: Joi.string(),
  destination: Joi.string(),
  filename: Joi.string(),
  path: Joi.string(),
  size: Joi.number(),
};

//______________________________________________________
export const generalFields = {
  // userName: Joi.string().min(2).max(40).empty("").default("user empty"),
  userName: Joi.string().min(2).max(50),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 2,
      tlds: { allow: ["com", "net", "edu"] }, //top limit domains tlds
    })
    .messages({
      "string.email": "Invalid email address",
      "string.empty": "Email is required can't be empty",
      "string.required": "Email is required",
    }),
  password: Joi.string().pattern(
    new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
  ),
  confirmationPassword: Joi.string(),
  phone: Joi.string().pattern(new RegExp(/^(\+2|002)?01[0125]{1}[0-9]{8}$/)),
  gender: Joi.string().valid(genderTypes.male, genderTypes.female),
  role: Joi.string().valid(...Object.values(roleTypes)),
  acceptLanguage: Joi.string().valid("en", "ar","en-US").default("en"), //from query
  DOB: Joi.date().less("now"),
  id: Joi.string().custom(validateObjectId),
  message: Joi.string().pattern(new RegExp(/^[\w\u0621 - \u046Aء-ئ]{1,}/)),
  codeOtp: Joi.string().pattern(new RegExp(/^\d{4}$/)),
  fileObject,
  file: Joi.object(fileObject),
  companyName: Joi.string().min(2).max(100),
  jobTitle: Joi.string().min(2).max(100),
  jobLocation: Joi.string().valid(...Object.values(jobTypes)),
  workingTime: Joi.string().valid(...Object.values(workingTimeTypes)),
  seniorityLevel: Joi.string().valid(...Object.values(seniorityLevelTypes)),
  jobDescription: Joi.string().min(10).max(5000),
  technicalSkills: Joi.array().items(Joi.string()).min(1),
  softSkills: Joi.array().items(Joi.string()).min(1),
  page:Joi.number().min(1).optional(), // ✅ Pagination: Page number (optional)
  limit: Joi.number().min(1).max(100).optional(), // ✅ Pagination: Items per page (optional)
  sortBy: Joi.string().valid("createdAt","jobTitle"), // 🔹 Sort option
  sortOrder: Joi.string().valid("asc","desc"), // 🔹 Sort order (ascending/descending)
  statusJob:Joi.string().valid(...Object.values(applicationStatusTypes)),

  // flag: Joi.boolean().sensitive(true).falsy(0).truthy(1),
  // age: Joi.number().positive().min(16).max(120),
  
  
};
//______________________________________________________

//______________________________________________________
export const validation = (Schema) => {
  return (req, res, next) => {
    const inputData = { ...req.body, ...req.params, ...req.query };
    if (req.headers["accept-language"]) {
      inputData["acceptLanguage"] = req.headers["accept-language"];
    }
    // files
    if (req.file || req.files?.length) {
      inputData.file = req.file || req.files;
    }
    const validationErrors = Schema.validate(
      inputData,
      { abortEarly: false } //not  stop at the first error but show all error
    );
    if (validationErrors.error) {
      return res.status(400).json({ message: validationErrors.error.details });
      //   return next(new Error(`${validationErrors.error.details}`, { cause: 400 }));
    }
    return next();
  };
};
//________________validation graph QL____________________
export const validation_graph = ({ Schema, inputData = {} }) => {
  const validationErrors = Schema.validate(
    inputData,
    { abortEarly: false } //not  stop at the first error but show all error
  );
  if (validationErrors.error) {
    throw new Error(
      JSON.stringify({
        message: "validationErrors",
        details: validationErrors.error.details,
      })
    );
  }
  return true;
};

//______________________________________________________

export const validation_customize = (Schema) => {
  return (req, res, next) => {
    // console.log(Schema);
    // console.log(Object.keys(Schema));

    const validationResult = [];
    for (const keys of Object.keys(Schema)) {
      const validationErrors = Schema[keys].validate(
        req[keys],
        { abortEarly: false } // stop at the first error
      );
      if (validationErrors.error) {
        validationResult.push(validationErrors.error.details);
      }
      if (validationResult.length > 0) {
        return res
          .status(400)
          .json({ message: "Invalid request", errors: validationResult });
      }
    }

    return next();

    // const validationErrors = Schema.validate(
    //   req.body,
    //   { abortEarly: false } // stop at the first error
    // );
    // if (validationErrors.error) {
    //   return res.status(400).json({ message: validationErrors.error.details });
    // //   return next(new Error(`${validationErrors.error.details}`, { cause: 400 }));
    //   }
    //  return next();
  };
};
//______________________________________________________
