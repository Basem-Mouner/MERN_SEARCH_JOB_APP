import { asyncHandler } from "../../../utils/response/error/error.handling.js";
import { successResponse } from "../../../utils/response/success.response.js";
import jobModel from "../../../DB/model/job.model.js";
import * as dbService from "../../../DB/db.services.js";
import { roleTypes } from "../../../middleWare/types/roleTypes.js";
import companyModel from "../../../DB/model/company.model.js";
import { paginate } from "../../../utils/Pagination/Pagination.js";
import applicationModel from "../../../DB/model/application.model.js";
import { cloud } from "../../../utils/multer/cloudinary.js";
import { getIo } from "../../socket/chat/chat.socket.controller.js";
import { socketConnections } from "../../../DB/model/user.model.js";

import { JopApplicationResponseTemplate } from "../../../utils/templates/jopApplicationResponse.js";
import { sendEmail } from "../../../utils/email/sendEmail.js";


//-1-✅ 🔹 Add a new job created by company HR or company owner
export const AddJob = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const userId = req.user._id; // 🔹 Get the logged-in user ID

  // 🔍 find company
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: { $exists: false } },
  })
  if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
  }
  // 🔹 Step 2: Check if user is the company owner or HR
  const isOwner = company.createdBy.toString() === userId.toString();
    const isHR = company.HRs.includes(userId.toString());
    if (!isOwner && !isHR) {
      return next(new Error("❌  Unauthorized! Only the company owner or HRs can add jobs.", { cause: 403 }));
    }
      // 🔹 Step 3: Create Job
      req.body.addedBy = userId;
      req.body.companyId = companyId;
  const newJob = await dbService.create({
    model: jobModel,
    data: {
      ...req.body,
    }
  });

  return successResponse({
    res,
    message: "✅ Job created successfully!",
    data: { newJob },
    status: 201,
  });
});
//-2-✅ 🔹 Update job details (Only Owner can update)
export const updateJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.user._id; // 🔹 Get the logged-in user ID
  // 🔹 Step 1: Fetch job
  const job = await dbService.findOne({
    model: jobModel,
    filter: { _id: jobId},
  });

  if (!job) {
    return next(new Error("❌ Job not found!", { cause: 404 }));
  }

  // 🔹 Step 2: Check if user is the job owner
  if (job.addedBy.toString() !== userId.toString()) {
    return next(new Error("❌ Unauthorized! Only the job owner can update the job.", { cause: 403 }));
  }

  // 🔹 Step 3: Update job

  req.body.updatedBy = userId;
  const updatedJob = await dbService.findOneAndUpdate({
    model: jobModel,
    filter: { _id: jobId },
    updateData: {
      ...req.body,
    }
  });

  return successResponse({
    res,
    message: "✅ Job updated successfully!",
    data: { updatedJob },
  })



});
//-3-✅ 🔹 Delete Job (Only HRs from the Same Company Can Delete)
export const deleteJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const userId = req.user._id; // 🔹 Get logged-in user ID
   // 🔹 Step 1: Fetch the job
   const job = await dbService.findOne({
    model: jobModel,
    filter: { _id: jobId},
  });

  if (!job) {
    return next(new Error("❌ Job not found!", { cause: 404 }));
  }
  // 🔹 Step 2: Fetch the company to check HRs
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: job.companyId, isDeleted: { $exists: false } },
  });
  if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
  }

  // 🔹 Step 3: Check if user is an HR from the same company
  if (!company.HRs.includes(userId.toString())) {
    return next(new Error("❌ Unauthorized! Only HRs from the same company can delete jobs.", { cause: 403 }));
  }

  // 🔹 Step 4: Delete job
   await dbService.findOneAndDelete({
    model: jobModel,
    filter: { _id: jobId },
  });

  return successResponse({
    res,
    message: "✅ Job deleted successfully!",
  })


});
//-4-✅ Get All Jobs or a Specific One for a Specific Company by mergeParams
export const getJobsOrSpecificJob = asyncHandler(async (req, res, next) => {
  const{companyId,jobId} = req.params;
  const { companyName, page = "1", limit = "2", sortBy="createdAt", sortOrder="desc" } = req.query;
 // 🔹 If a specific job ID is provided, fetch it directly
  if(jobId){
    const job = await dbService.findOne({
      model: jobModel,
      filter: { _id: jobId ,companyId},
    })
    if (!job) {
      return next(new Error("❌ Job not found!", { cause: 404 }));
    }
    return successResponse({
      res,
      message: "✅ Job found successfully!",
      data: { job },
    })
  }

  let filter = { companyId };
 // 🔹 If searching by company name, find the company first
  if(companyName){
    
    const company = await dbService.findOne({
      model: companyModel,
      filter: { companyName: { $regex: companyName, $options: "i" } }, // Case-insensitive search
    })
    if (!company) {
      return next(new Error("❌ No company found with this name!", { cause: 404 }));
    }
    filter.companyId = company._id; // 🔹 Get jobs for the found company
  }
  // 🔹 Get total jobs 

  const paginatedJobs = await paginate({
    model: jobModel,
    filter,
    page,
    limit,
    sort:{ [sortBy]: sortOrder === "asc" ? 1 : -1 }
  }) 

  return successResponse({
    res,
    message: "✅ Jobs found successfully!",
    data: { paginatedJobs },
  })
})
//-5-✅ Get Jobs Filters
export const getJobsFilters = asyncHandler(async (req, res, next) => {
  // ✅ Extract query params with defaults
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
    page = 1,
    limit = 2,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // ✅ Build the filter object
  let filter = {};

  if (workingTime) filter.workingTime = workingTime;
  if (jobLocation) filter.jobLocation = jobLocation;
  if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
  if (jobTitle) filter.jobTitle = { $regex: new RegExp(jobTitle, "i") }; // 🔹 Case-insensitive search
  if (technicalSkills) filter.technicalSkills = { $in: technicalSkills }; // 🔹 Matches any of the skills

const paginatedJobs = await paginate({
    model: jobModel,
    filter,
    page,
    limit,
    sort:{ [sortBy]: sortOrder === "asc" ? 1 : -1 }
  }) 

  return successResponse({
    res,
    message: "✅ Jobs fetched successfully! ",
    data: { paginatedJobs },
  })
  
})
//-6-✅ API: Get All Applications for a Specific Job
export const getApplications = asyncHandler(async (req, res, next) => {
const {companyId,jobId} = req.params;
const userId = req.user._id; // 🔹 Get the logged-in user ID
const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
 // ✅ Check if Job Exists
  const job = await dbService.findOne({
    model: jobModel,
    filter: { _id: jobId ,companyId},
  });
  if (!job) {
    return next(new Error("❌ Job not found!", { cause: 404 }));
  }
   // ✅ Ensure Only HR or Company Owner Can Access Applications
   const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId,isDeleted: { $exists: false } },
   });
   if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
   }
   const isOwner = company.createdBy.toString() === userId.toString();
   const isHR = company.HRs.includes(userId.toString());
   if (!isOwner && !isHR) {
     return next(new Error("❌  Unauthorized! Only the company owner or HRs can show applications", { cause: 403 }));
   }

   const applicationsPaginated = await paginate({
     model: applicationModel,
     filter: { jobId },
     page,
     limit,
     sort:{ [sortBy]: sortOrder === "asc" ? 1 : -1 },
     populate: [
      {
        path: "userDetails",
        select: "firstName userName lastName email",
      }
    ]
   });

   return successResponse({
     res,
     message: "✅ Applications fetched successfully!",
     data: { applicationsPaginated },
   });

})
//-7-✅ Apply to Job (Job Application) API
export const applyToJob = asyncHandler(async (req, res, next) => {
  const {jobId} = req.params;

  console.log(req.file);
  // ✅ Ensure only Users can apply
  if (req.user.role!== roleTypes.user) {
    return next(new Error("❌ Unauthorized! Only users can apply to jobs.", { cause: 403 }));
  }

  // ✅ Check if Job Exists
  const job = await dbService.findOne({
    model: jobModel,
    filter: { _id: jobId },
  })
  if (!job) {
    return next(new Error("❌ Job not found!", { cause: 404 }));
  }
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: job.companyId, isDeleted: { $exists: false } },
   })
   if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
   }
  // ✅ Check if the User Already Applied
  const existingApplication = await dbService.findOne({
    model: applicationModel,
    filter: { jobId, userId: req.user._id },
  });
  if (existingApplication) {
    return next(new Error("❌ You have already applied to this job!", { cause: 400 }));
  }
const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/user/${req.user._id}/companies/${job.companyId}/jobs/${jobId}/application`,
    // publicId: req.user._id,
    // resource_type: "raw", // 🔹 Accepts PDFs, images, etc.// Ensures PDFs are handled correctly
    format: "pdf", // Ensure it's saved as PDF
    access_mode: "public" , // ✅ This makes the file accessible
    access_control: [{ access_type: "anonymous" }]  // ✅ Allows public access
  });

//    // ✅ Save Application
   const newApplication = await dbService.create({
    model: applicationModel,
    data: {
      jobId,
      userId: req.user._id,
      userCV: { secure_url, public_id },
    }

   })

     // ✅ Emit Socket Event to Notify HRs
     const hrIds = [company.createdBy, ...company.HRs]; // 🔹 HRs & Owner
    //  console.log(hrIds);
    //  console.log(hrIds.map(id => socketConnections.get(id.toString())));

     getIo().to(hrIds.map(id => socketConnections.get(id.toString()))).emit("newApplication", {
      message: `📢 New application received for ${job.jobTitle} job`,
      jobId,
      userId: req.user._id,
    });

     return successResponse({
      res,
      message: "✅ Application submitted successfully!",
      data: { newApplication },
    });
     




  

  
  


})
//-8-✅ Accepting/Rejecting an Applicant by HR
export const acceptOrRejectApplicant = asyncHandler(async (req, res, next) => {
  const { jobId, applicantId } = req.params;
  const { status } = req.body; // "accepted" or "rejected"
   // ✅ Find application
   const application = await dbService.findOne({
    model: applicationModel,
    filter: { _id: applicantId, jobId },
    populate: [
    //   {
    //   path: "userId",
    //   select: "firstName lastName email"
    // },
    {
      path: "jobDetails",
      select: "jobTitle"
    },
    
    {
      path: "userDetails",
      select: "firstName lastName userName email"
    }

  ],
   });
   if (!application) {
    return next(new Error("❌ Application not found!", { cause: 404 }));
   };
   // 🔹 2. Find the job to check HR ownership
   const job = await dbService.findOne({
    model: jobModel,
    filter: { _id: jobId, closed: { $exists: false } },
    populate: [
      {
        path: "companyDetails",
        select: "HRs"
      }
      
    ]
   })
   if (!job) {
    return next(new Error("❌ Job not found!", { cause: 404 }));
   }
    // 🔹 3. Ensure the logged-in user is the HR of this company

   if (job.companyDetails.HRs.indexOf(req.user._id) === -1) {
    return next(new Error("❌ Unauthorized! Only HRs can accept/reject applications.", { cause: 403 }));
   }

   // ✅ Update application status
   application.status = status;
   await application.save();

   // ✅ Send Email Notification
   const subject = status === "accepted" ? 
   "🎉 Job Application Accepted!" :
    "❌ Job Application Rejected";
   const message = status === "accepted" ? 
   `Dear ${application.userDetails.userName},\n\n🎉 Congratulations! Your application for ${application.jobDetails.jobTitle} has been accepted. 🎉`
    : `Dear ${application.userDetails.userName},\n\n ❌ Unfortunately, We regret to inform you that your application for ${application.jobDetails.jobTitle} has been rejected. We appreciate your effort and encourage you to apply again in the future.`;
    
// send email to user
const html=JopApplicationResponseTemplate(message,application.userDetails.userName)
await sendEmail({
    to: application.userDetails.email,
    subject,
    html,
  });

   return successResponse({
    res,
    message:  `✅ Application ${status} successfully!`,
    data: { application },
   })

})

