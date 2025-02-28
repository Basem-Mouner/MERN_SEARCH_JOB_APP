import mongoose, { model, Schema, Types } from "mongoose";
import { applicationStatusTypes } from "../../middleWare/types/applicationStatusTypes.js";








const applicationSchema    = new Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "job", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    userCV : { secure_url: String, public_id: String }, // Resume as PDF/Image
    status: {
        type: String,
        enum: Object.values(applicationStatusTypes),
        default: applicationStatusTypes.pending,
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


// ✅ Virtual Populate: Fetch User Details in Applications
applicationSchema.virtual("userDetails", {
    ref: "user",
    localField: "userId",
    foreignField: "_id",
    justOne: true,
  });
  applicationSchema.virtual("jobDetails", {
    ref: "job",
    localField: "jobId",
    foreignField: "_id",
    justOne: true,
  });
  



const applicationModel = mongoose.models.application|| model("application", applicationSchema  );
export default applicationModel;