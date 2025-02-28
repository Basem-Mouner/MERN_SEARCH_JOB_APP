import Joi from "joi";
import { generalFields } from "../../middleWare/validation.middleware.js";

export const addJob = Joi.object()
  .keys({
    companyId: generalFields.id.required(), // 🔹 Ensure a company is provided
    jobTitle: generalFields.jobTitle.required(), // 🔹 Job title must be 2-100 chars
    jobLocation: generalFields.jobLocation, // 🔹 Must be one of these values
    workingTime: generalFields.workingTime, // 🔹 Must be part-time or full-time
    seniorityLevel: generalFields.seniorityLevel, // 🔹 Must be one of these levels
    jobDescription: generalFields.jobDescription.required(), // 🔹 Description must be 10-5000 chars
    technicalSkills: generalFields.technicalSkills, // 🔹 At least 1 technical skill
    softSkills: generalFields.softSkills, // 🔹 At least 1 soft skill
  })
  .options({
    allowUnknown: false, //very dangerous at assign true be carful // ❌ Prevent unknown fields
  })
  .required();

export const updateJob = Joi.object().keys({
    jobTitle: generalFields.jobTitle,
    jobLocation: generalFields.jobLocation,
    workingTime: generalFields.workingTime,
    seniorityLevel: generalFields.seniorityLevel,
    jobDescription: generalFields.jobDescription,
    technicalSkills: generalFields.technicalSkills,
    softSkills: generalFields.softSkills,
    jobId: generalFields.id.required(),

}).options({
    allowUnknown: false, // ❌ Prevent unknown fields
  })
  .required();
  export const deleteJob = Joi.object().keys({
    jobId: generalFields.id.required(),
  }).options({
    allowUnknown: false, // ❌ Prevent unknown fields
  })
  .required();
  export const getJobsOrSpecificJob = Joi.object().keys({
    companyId: generalFields.id.required(),
    jobId: generalFields.id,
    companyName:generalFields.companyName,
    page:generalFields.page.optional(), // ✅ Pagination: Page number (optional)
    limit: generalFields.limit.optional(), // ✅ Pagination: Items per page (optional)
    sortBy:generalFields.sortBy.optional(), // 🔹 Sort option
    sortOrder:generalFields.sortOrder.optional(), // 🔹 Sort order (ascending/descending)
  }).options({
    allowUnknown: false, // ❌ Prevent unknown fields
  })
  .required();
  export const getJobs = Joi.object().keys({
  workingTime: generalFields.workingTime.optional(),
  jobLocation:generalFields.jobLocation.optional(),
  seniorityLevel:generalFields.seniorityLevel.optional(),
  jobTitle: generalFields.jobTitle.optional(),
  technicalSkills: Joi.string().optional(), // Array of skills
  page: generalFields.page.optional(),
  limit: generalFields.limit.optional(),
  sortBy:generalFields.sortBy.optional(),
  sortOrder: generalFields.sortOrder.optional(),
  }).options({
    allowUnknown: false, // ❌ Prevent unknown fields
  })
  .required();

  export const getApplications = Joi.object().keys({
    jobId: generalFields.id.required(),
    companyId: generalFields.id.required(),
    page:generalFields.page.optional(), // ✅ Pagination: Page number (optional)
    limit: generalFields.limit.optional(), // ✅ Pagination: Items per page (optional)
    sortBy:generalFields.sortBy.optional(), // 🔹
    sortOrder:generalFields.sortOrder.optional(),
    acceptLanguage: generalFields.acceptLanguage,

    }).options({
      allowUnknown: false, // ❌ Prevent unknown fields
    })
    .required();

    export const applyToJob = Joi.object().keys({
      jobId: generalFields.id.required(),   
      }).options({
        allowUnknown: false, // ❌ Prevent unknown fields
      })
      .required();

      export const acceptOrRejectApplicant = Joi.object().keys({
      jobId: generalFields.id.required(), 
      applicantId: generalFields.id.required(),
      status:generalFields.statusJob.required(),  
      }).options({
        allowUnknown: false, // ❌ Prevent unknown fields
      })
      .required();
      