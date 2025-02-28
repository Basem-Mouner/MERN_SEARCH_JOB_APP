import mongoose, { model, Schema, Types } from "mongoose";
import { jobTypes } from "../../middleWare/types/jobTypes.js";
import { workingTimeTypes } from "../../middleWare/types/workingTimeTypes.js";
import { seniorityLevelTypes } from "../../middleWare/types/seniorityLevelTypes.js";
// import moment from "moment"; // 🔥 Import moment.js

const jobSchema   = new Schema(
  {
    jobTitle: { type: String, required: true},
    jobLocation: {
      type: String,
      enum: Object.values(jobTypes), // 🔹 Only allow specific values
    },
    workingTime: {
      type: String,
      enum: Object.values(workingTimeTypes), // 🔹 Define allowed options
    //   required: true,
    },
    seniorityLevel: {
      type: String,
      enum: Object.values(seniorityLevelTypes),
    //   required: true,
    },
    jobDescription: { type: String, required: true},
    technicalSkills: [{ type: String}], // 🔹 Array of technical skills
    softSkills: [{ type: String}], // 🔹 Array of soft skills
    addedBy: {
      type: Types.ObjectId,
      ref: "user", // 🔹 HR ID (User model reference)
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "user", // 🔹 HR ID (User model reference)
    },
    closed: { type: Boolean}, // 🔹 Job status
    companyId: {
      type: Types.ObjectId,
      ref: "Company", // 🔹 Reference to Company Model
      required: true,
    },
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

jobSchema.virtual("companyDetails", {
  ref: "company",
  localField: "companyId",
  foreignField: "_id",
  justOne: true,
});

//✅ Middleware: Delete All Applications When a Job is Deleted
jobSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
      const jobId = this._id; // 🔹 Get the job ID before deletion

      // 🔥 Step 1: Delete All Applications Related to This Job
      await dbServices.deleteMany({
          model: applicationModel,
          filter: { jobId },
      });
      console.log(`✅ Successfully deleted applications related to job ${jobId}`);
      next(); // 🔹 Continue with deleting the job
  } catch (error) {
      console.error("❌ Error deleting applications:", error);
      next(error); // 🔹 Pass error to Mongoose
  }
});


const jobModel = mongoose.models.job|| model("job", jobSchema );
export default jobModel;