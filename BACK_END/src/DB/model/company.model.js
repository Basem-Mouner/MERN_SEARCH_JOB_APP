import mongoose, { model, Schema, Types } from "mongoose";
import applicationModel from "./application.model.js";
import jobModel from "./job.model.js";
import * as dbServices from "../db.services.js";

const companySchema  = new Schema(
  {
    companyName: { type: String, unique: true, required: true },
    description: { type: String, required: true },
    industry: { type: String },// 📌( Like Mental Health care )
    address: { type: String },
    numberOfEmployees: {
        type: [Number], // 🔹 Store as an array with [min, max]
        validate: {
          validator: function (v) {
            return v.length === 2 && v[0] < v[1]; // ✅ Ensure [min, max] & min < max
          },
          message: "❌ numberOfEmployees must be an array [min, max] and min must be less than max!",
        },
      },
    companyEmail: { type: String, unique: true, required: true },
    createdBy: { type:Types.ObjectId, ref: "User", required: true }, // 🔹 Reference to user
    logo: {
      secure_url: { type: String},
      public_id: { type: String },
    },
    coverPic: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    HRs: [{ type: Types.ObjectId, ref: "User" }], // 🔹 Array of users
    bannedAt: { type: Date},
    isDeleted: { type: Boolean },
    deletedAt: { type: Date },
    legalAttachment: {
      secure_url: { type: String},
      public_id: { type: String },
      fileType: {
        type: String,
        enum: ["pdf", "image"], // 🔹 Only allow PDF or Image
      },
    },
    approvedByAdmin: { type: Boolean }, // 🔹 Default: Not approved
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);


// 🔹 Virtual populate to fetch related jobs
companySchema.virtual("jobs", {
    ref: "job",
    localField: "_id",
    foreignField: "companyId",
  });
  // ✅ Middleware: Delete All Related Jobs & Applications Before Deleting Company
  companySchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        const companyId = this._id; // 🔹 Get company ID

         // 🔥 Step 1: Find All Jobs Related to This Company
         const jobs = await dbServices.findAll({
             model: jobModel,
             filter: { companyId },
         });

         const jobIds = jobs.map(job => job._id); // ✅ Extract job IDs
 
         // 🔥 Step 2: Delete All Applications Related to Those Jobs
         await dbServices.deleteMany({
             model: applicationModel,
             filter: { jobId: { $in: jobIds } },
         })
        //  await applicationModel.deleteMany({ jobId: { $in: jobIds } });
 
         // 🔥 Step 3: Delete All Jobs Related to This Company
         await dbServices.deleteMany({
             model: jobModel,
             filter: { companyId },
         })
        //  await jobModel.deleteMany({ companyId });


        console.log(`✅ Successfully deleted jobs & applications for company ${companyId}`);
        next(); // 🔹 Continue with deleting the company
    } catch (error) {
        console.error("❌ Error deleting jobs & applications:", error);
        next(error); // 🔹 Pass error to Mongoose
    }
});



const companyModel = mongoose.models.company|| model("company", companySchema);
export default companyModel;