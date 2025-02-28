import mongoose, { model, Schema, Types } from "mongoose";

const friendRequestSchema = new Schema(
  {
    friendId: { type:Types.ObjectId, ref: "user", required: true },
    createdBy: { type: Types.ObjectId, ref: "user", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

 const friendRequestModel = mongoose.models.FriendRequest || model("FriendRequest", friendRequestSchema);
 export default friendRequestModel;
