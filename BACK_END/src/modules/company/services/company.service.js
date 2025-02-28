import { asyncHandler } from "../../../utils/response/error/error.handling.js";
import { successResponse } from "../../../utils/response/success.response.js";
import companyModel from "../../../DB/model/company.model.js";
import * as dbService from "../../../DB/db.services.js";
import { roleTypes } from "../../../middleWare/types/roleTypes.js";
import { cloud } from "../../../utils/multer/cloudinary.js";
import userModel from "../../../DB/model/user.model.js";
import applicationModel from "../../../DB/model/application.model.js";
import XLSX from "xlsx";
import path from "path";
import fs from "fs";

//----------------------------------------------------------------------------------------
//-1-✅ add new company
export const AddCompany = asyncHandler(async (req, res, next) => {
  const { companyName, companyEmail, ...otherData } = req.body;

  // ✅ Check if company name or email already exists
  const existingCompany = await dbService.findOne({
    model: companyModel,
    filter: {
      $or: [{ companyName }, { companyEmail }],
      isDeleted: { $exists: false },
    },
  });

  if (existingCompany) {
    return next(new Error("❌ Company already exists!", { cause: 409 }));
  }
  //add createdBy to req.body
  req.body.createdBy = req.user._id;

  const company = await dbService.create({
    model: companyModel,
    data: req.body,
  });

  return successResponse({
    res,
    message: "✅ Company created successfully!",
    data: { company },
    status: 201,
  });
});
//-2-✅ Update company data.
export const updateCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const userId = req.user._id; // Get logged-in user ID
  // 🔍 Find company by ID
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: { $exists: false } },
  });
  if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
  }
  // ✅ Ensure only the owner can update
  if (company.createdBy.toString() !== userId.toString()) {
    // User is not the owner
    return next(
      new Error("❌ You are not authorized to update this company!", {
        cause: 403,
      })
    );
  }
  // ❌ Prevent updating `legalAttachment`
  const { legalAttachment, ...updateData } = req.body;
  // 🔍 Check if company name or email already exists
  if (updateData.companyEmail || updateData.companyName) {
    const existingCompany = await dbService.findOne({
      model: companyModel,
      filter: {
        $or: [
          { companyName: updateData.companyName },
          { companyEmail: updateData.companyEmail },
        ],
      },
    });

    if (existingCompany) {
      return next(
        new Error("❌ Company email already exists!", { cause: 409 })
      );
    }
  }
  const updatedCompany = await dbService.findOneAndUpdate({
    model: companyModel,
    filter: { _id: companyId, isDeleted: { $exists: false } },
    updateData,
  });

  return successResponse({
    res,
    message: "✅ Company updated successfully!",
    data: { updatedCompany },
  });
});
//-3-✅ Delete company
export const softDeleteCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const userId = req.user._id; // Get logged-in user ID
  const userRole = req.user.role;
  // 🔍 Find company by ID
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: { $exists: false } },
  });
  if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
  }
  // ✅ Check if user is the owner or an admin
  const isOwner = company.createdBy.toString() === userId.toString();
  if (!isOwner && userRole !== roleTypes.admin) {
    return next(
      new Error("❌ You are not authorized to delete this company!", {
        cause: 403,
      })
    );
  }

  // ✅ Perform soft delete
  company.deletedAt = Date.now();
  company.isDeleted = true;
  await company.save();

  return successResponse({
    res,
    message: "✅ Company soft deleted successfully!",
  });
});
//-4- ✅ specific company with related jobs
export const relatedJobCompany = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;

  // 🔍✅ Find the company and populate jobs
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: { $exists: false } },
    populate: [
      {
        path: "jobs", // Populate jobs using virtual field
      },
    ],
  });
  if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
  }

  return successResponse({
    res,
    message: "✅ Company data fetched successfully!",
    data: { company },
  });
});
//-5- ✅ Search company by name
export const searchCompanyByName = asyncHandler(async (req, res, next) => {
  const { companyName } = req.query;

  const companies = await dbService.findAll({
    model: companyModel,
    filter: {
      isDeleted: { $exists: false },
      companyName: { $regex: companyName, $options: "i" }, // 🔍 Case-insensitive search
    },
    populate: [
      {
        path: "jobs", // Populate jobs using virtual field
      },
    ],
  });
  if (companies.length === 0) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
  }

  return successResponse({
    res,
    message: "✅ Company data fetched successfully!",
    data: { companies },
  });
});
//-6- ✅ upload company logo
export const uploadCompanyLogo = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const userId = req.user._id; // Get logged-in user ID

  // 🔹 Ensure a file was uploaded
  if (!req.file) {
    return next(new Error("❌ No file uploaded!", { cause: 404 }));
  }

  // 🔍 Find company by ID
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: { $exists: false } },
  });
  if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
  }
  // ✅ Check if user is the owner or an admin
  const isOwner = company.createdBy.toString() === userId.toString();
  if (!isOwner) {
    return next(
      new Error("❌ You are not authorized to upload logo image", {
        cause: 403,
      })
    );
  }

  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/user/${req.user._id}/companies/${companyId}/logoImage`,
    // publicId: req.user._id,
    // resourceType: "image",
  });

  // 🔹 Update company with logo
  company.logo = { secure_url, public_id };
  await company.save();

  //   const updatedCompany  =await dbService.findByIdAndUpdate({
  //     model: companyModel,
  //     id: companyId,
  //     updateData: {
  //         logo: { secure_url, public_id },  //case cloud storage
  //     },
  //   });

  return successResponse({
    res,
    message: "✅ Company logo uploaded successfully!",
    data: {
      logo: {
        secure_url: company.logo.secure_url,
        public_id: company.logo.public_id,
      },
    },
  });
});
//-6- ✅ upload company cover image
export const uploadCompanyCoverPic = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const userId = req.user._id; // Get logged-in user ID

  // 🔹 Ensure a file was uploaded
  if (!req.file) {
    return next(new Error("❌ No file uploaded!", { cause: 404 }));
  }

  // 🔍 Find company by ID
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: { $exists: false } },
  });
  if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
  }
  // ✅ Check if user is the owner or an admin
  const isOwner = company.createdBy.toString() === userId.toString();
  if (!isOwner) {
    return next(
      new Error("❌ You are not authorized to upload logo image", {
        cause: 403,
      })
    );
  }

  const { secure_url, public_id } = await cloud.uploader.upload(req.file.path, {
    folder: `${process.env.APP_NAME}/user/${req.user._id}/companies/${companyId}/coverImage`,
    // publicId: req.user._id,
    // resourceType: "image",
  });

  // 🔹 Update company with logo
  company.coverPic = { secure_url, public_id };
  await company.save();

  return successResponse({
    res,
    message: "✅ Company cover image uploaded successfully!",
    data: {
      coverPic: {
        secure_url: company.coverPic.secure_url,
        public_id: company.coverPic.public_id,
      },
    },
  });
});
//-7- ✅ delete company logo
export const deleteCompanyLogo = asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const userId = req.user._id; // Get logged-in user ID

  // 🔍 Find company
  const company = await dbService.findOne({
    model: companyModel,
    filter: { _id: companyId, isDeleted: { $exists: false } },
  });
  if (!company) {
    return next(new Error("❌ Company not found!", { cause: 404 }));
  }

  // ✅ Check if user is the owner or an admin
  const isOwner = company.createdBy.toString() === userId.toString();
  if (!isOwner) {
    return next(
      new Error("❌ You are not authorized to delete logo image", {
        cause: 403,
      })
    );
  }

  if (!company.logo?.secure_url || !company.logo?.public_id) {
    return next(new Error("❌ No image found to delete.", { cause: 404 }));
  }
  // 🔥 Delete image from Cloudinary
  await cloud.uploader.destroy(company.logo.public_id);

  // ✅ Remove the image from the company

  await dbService.findByIdAndUpdate({
    model: companyModel,
    id: companyId,
    updateData: {
      $unset:{ logo: null }}
  });

  return successResponse({
    res,
    message: "✅ Company logo deleted successfully!",
  })

});
//-8- ✅ delete company cover image
export const deleteCompanyCoverPic = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const userId = req.user._id; // Get logged-in user ID
  
    // 🔍 Find company
    const company = await dbService.findOne({
      model: companyModel,
      filter: { _id: companyId, isDeleted: { $exists: false } },
    });
    if (!company) {
      return next(new Error("❌ Company not found!", { cause: 404 }));
    }
  
    // ✅ Check if user is the owner or an admin
    const isOwner = company.createdBy.toString() === userId.toString();
    if (!isOwner) {
      return next(
        new Error("❌ You are not authorized to delete logo image", {
          cause: 403,
        })
      );
    }
  
    if (!company.coverPic?.secure_url || !company.coverPic?.public_id) {
      return next(new Error("❌ No image found to delete.", { cause: 404 }));
    }
    // 🔥 Delete image from Cloudinary
    await cloud.uploader.destroy(company.coverPic.public_id);
  
    // ✅ Remove the image from the company
  
    await dbService.findByIdAndUpdate({
      model: companyModel,
      id: companyId,
      updateData: {
        $unset:{ coverPic: null }}
    });
  
    return successResponse({
      res,
      message: "✅ Company cover image deleted successfully!",
    })
  
  });
  //-9- ✅ push hr to company
  export const pushHRs = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;
    const { hrId } = req.body;
    const userId = req.user._id; // Get logged-in user ID
  
    // 🔍 Find company
    const company = await dbService.findOne({
      model: companyModel,
      filter: { _id: companyId, isDeleted: { $exists: false } },
    });
    if (!company) {
      return next(new Error("❌ Company not found!", { cause: 404 }));
    }
  
    // ✅ Check if user is the owner or an admin
    const isOwner = company.createdBy.toString() === userId.toString();
    if (!isOwner) {
      return next(
        new Error("❌ You are not authorized to add hr to this company", {
          cause: 403,
        })
      );
    }

    // 🔍 Find hr
    const hr = await dbService.findOneAndUpdate({
      model: userModel,
      filter: { _id: hrId, isDeleted: { $exists: false } },
      updateData: {
        role: roleTypes.hr
      }
    });
    if (!hr) {
      return next(new Error("❌ Hr user not found!", { cause: 404 }));
    }



    // ✅ Add hr to company
    await dbService.findByIdAndUpdate({
      model: companyModel,
      id: companyId,
      updateData: {
        $addToSet: {
          HRs: hrId
        }
      }
    });
    return successResponse({
      res,
      message: "✅ Hr added to company successfully!",
    })


  });
  //-10- get all company
  export const allCompany = asyncHandler(async (req, res, next) => {
    const companies = await dbService.findAll({
      model: companyModel,
      filter: { 
        approvedByAdmin: true,
        isDeleted: { $exists: false }
      },
    })
    if (companies.length === 0) {
      return next(new Error("❌ Companies not found!", { cause: 404 }));
    }

    return successResponse({
      res,
      message: "✅ Companies fetched successfully!",
      data: { companies },
    })
  })

//-11-Add an endpoint that collects the applications for a specific company on a specific day and creates an Excel sheet with this data
export const exportJobApplications= asyncHandler(async (req, res, next) => {
  const { companyId } = req.params;
  const { date } = req.body;
  // console.log({ companyId, date });

  const selectedDate = new Date(date);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(selectedDate.getDate() + 1);
  // console.log({ selectedDate, nextDay });
  // ✅ Step 1: Fetch Applications from Database
  const applications = await applicationModel.find({
    createdAt: { $gte: selectedDate, $lt: nextDay }, // 🔹 Filter by Date
  })
  .populate({
    path: "jobId", // 🔹 Get Job Details
    match: { companyId }, // ✅ Only jobs from the requested company
    select: "jobTitle companyId", // 🔹 Get only companyId
  })
  .populate("userId", " firstName lastName userName email mobileNumber") // ✅ Get user details
  .lean(); // 🔹 Convert to plain JavaScript object

  const filteredApplications = applications.filter(app => app.jobId);

  if (!filteredApplications.length) {
    return next(new Error("❌ No applications found for this date!", { cause: 404 }));
    
  }
    // ✅ Step 3: Convert to Excel
    const data = filteredApplications.map(app => ({
      "Applicant Name": `${app.userId.firstName} ${app.userId.lastName}`,
      "Email": app.userId.email,
      "Mobile Number": app.userId.mobileNumber,
      "Applied At": app.createdAt.toISOString(),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
  
// ✅ Step 4: Ensure Directory Exists
const baseDir = path.resolve("./src/uploads"); // 🔹 Define uploads directory
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true }); // ✅ Create directory if not exists
}
// ✅ Step 5: Define Excel File Path
const fileName = `applications_${companyId}_${date}.xlsx`; // 🔹 Define file name
const fullPath = path.join(baseDir, fileName); // ✅ Combine directory + filename

// ✅ Step 6: Write Excel File
XLSX.writeFile(workbook, fullPath); //✅ Save file locally

 // ✅ Step 7: Upload Excel to Cloudinary

 const { secure_url, public_id } = await cloud.uploader.upload(fullPath, {
  resource_type: "raw", // ✅ Ensure Cloudinary treats it as a file
  folder: `${process.env.APP_NAME}/applications/${companyId}`, // 🔹 Organize in folder
  use_filename: true, // ✅ Keep original file name
  unique_filename: false, // 🔹 Prevent renaming
});
// // ✅ Step 5: Delete Local File (Cleanup) if needed
// fs.unlinkSync(fullPath);



return successResponse({
  res,
  message: "✅ Applications fetched successfully!",
  data: { applications,
    linkSheet:{secure_url,public_id}
   },
})
  
})

//----------------------------------------------------------------------------------------
