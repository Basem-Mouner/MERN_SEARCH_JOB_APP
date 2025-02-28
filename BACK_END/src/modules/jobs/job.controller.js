import { Router } from "express";
const router = Router({
  mergeParams: true,
//   strict: true,
  caseSensitive: true,
});

import * as jobServices from "./services/job.service.js";
import * as validators from "./job.validation.js";
import {
  authentication,
  authorization,
} from "../../middleWare/auth.middleware.js";
import { endPoint } from "./job.endPoint.js";
import { validation } from "../../middleWare/validation.middleware.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { fileValidationTypes } from "../../middleWare/types/fileValidationTypes.js";

// 🔹, ✅, 🚀, ⚠, ❌, 📌, 🔥 ,😊,💪,🔍

// 🔹 Add a new job created by company HR or company owner
router.post(
  "/:companyId",
  validation(validators.addJob),
  authentication(),
  authorization(endPoint.profile),
  jobServices.AddJob
);
// 🔹 Update job details (Only Owner can update)
router.patch(
  "/:jobId",
  validation(validators.updateJob),
  authentication(),
  authorization(endPoint.profile),
  jobServices.updateJob
);
//✅ Delete Job (Only HRs from the Same Company Can Delete)
router.delete(
  "/:jobId",
  validation(validators.deleteJob),
  authentication(),
  authorization(endPoint.profile),
  jobServices.deleteJob
);
//🔹 API: Get Jobs with Filters & Pagination
router.get("/getJobsFilters",validation(validators.getJobs), authentication(), authorization(endPoint.profile), jobServices.getJobsFilters);
//✅ Get All Jobs or a Specific One for a Specific Company by mergeParams
router.get("/:jobId?",validation(validators.getJobsOrSpecificJob), authentication(), authorization(endPoint.profile), jobServices.getJobsOrSpecificJob);
//-6-🔹 API: Get All Applications for a Specific Job
router.get('/:jobId/applications',validation(validators.getApplications), authentication(), authorization(endPoint.profile), jobServices.getApplications);
//-7-🔹 Apply to Job (Job Application) API
router.post('/:jobId/apply',
     validation(validators.applyToJob),
     authentication(), authorization(endPoint.user),
     uploadCloudFile({
    fileValidation: fileValidationTypes.document,
  }).single("pdf"), jobServices.applyToJob);
//-8- 🔹 Accepting/Rejecting an Applicant
router.patch('/:jobId/applications/:applicantId',validation(validators.acceptOrRejectApplicant),
    authentication(), authorization(endPoint.profile), jobServices.acceptOrRejectApplicant); 

//________________________________
export default router;
