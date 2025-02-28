import { Router } from "express";
const router = Router();

import * as companyServices from "./services/company.service.js";
import * as validators from "./company.validation.js";
import { authentication, authorization } from "../../middleWare/auth.middleware.js";
import { endPoint } from "./company.endPoint.js";
import { validation } from "../../middleWare/validation.middleware.js";
import { uploadCloudFile } from "../../utils/multer/cloud.multer.js";
import { fileValidationTypes } from "../../middleWare/types/fileValidationTypes.js";
import jobController from "../jobs/job.controller.js";



// 🔹 Add a new company
router.post("/",validation(validators.addCompany),authentication(),authorization(endPoint.profile),companyServices.AddCompany);
// 🔹 Update company details (Only Owner can update)
router.patch("/:companyId",authentication(),validation(validators.updateCompany),authorization(endPoint.profile),companyServices.updateCompany);
// 🔹 Soft delete company (Admin or Owner only)
router.delete("/:companyId",validation(validators.deleteCompany),authentication(),authorization(endPoint.profile),companyServices.softDeleteCompany);
// 🔹 Search company by name
router.get('/search',validation(validators.searchCompany),authentication(),authorization(endPoint.profile),companyServices.searchCompanyByName);
// 🔹 Get all company
router.get('/',authentication(),authorization(endPoint.profile),companyServices.allCompany);
// 🔹 Get specific company with related jobs
router.get('/relatedJob/:companyId',validation(validators.getCompany),authentication(),authorization(endPoint.profile),companyServices.relatedJobCompany);
// 🔹 upload Company Logo 
router.patch("/logo/:companyId",
    validation(validators.updateLogo),
  authentication(),
  authorization(endPoint.profile),
  uploadCloudFile({
    fileValidation: fileValidationTypes.image,
  }).single("image"),
  companyServices.uploadCompanyLogo
);
// 🔹 delete Company Logo 
router.delete("/logo/:companyId",
  validation(validators.updateLogo),
  authentication(),
  authorization(endPoint.profile),
  companyServices.deleteCompanyLogo
);
// 🔹 upload Company cover image 
router.patch("/coverPic/:companyId",
    validation(validators.updateCoverPic),
  authentication(),
  authorization(endPoint.profile),
  uploadCloudFile({
    fileValidation: fileValidationTypes.image,
  }).single("image"),
  companyServices.uploadCompanyCoverPic
);
// 🔹delete company cover image
router.delete("/coverPic/:companyId",
  validation(validators.updateCoverPic),
  authentication(),
  authorization(endPoint.profile),
  companyServices.deleteCompanyCoverPic
);
//🔹Push HRs to a Company (Only Company Owner Can Do It)
router.patch("/pushHRs/:companyId",validation(validators.pushHRs),authentication(),authorization(endPoint.profile),companyServices.pushHRs);

//🚀 API to Export Job Applications to Excel📜 Bonus Point

router.get('/exportJobApplications/:companyId/',
  validation(validators.exportJobApplications),
  authentication(),
  authorization(endPoint.profile),
  companyServices.exportJobApplications);


// 🔹 use merge params to go to job with company id
router.use("/:companyId/job", jobController);

//________________________________
export default router;