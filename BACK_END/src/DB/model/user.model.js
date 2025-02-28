import mongoose, { model, Schema, Types } from "mongoose";
import { roleTypes } from "../../middleWare/types/roleTypes.js";
import { genderTypes } from "../../middleWare/types/genderTypes.js";
import { providerTypes } from "../../middleWare/types/providerTypes.js";
import { generateHash } from "../../utils/security/hash.js";
import { subjectTypes } from "../../middleWare/types/subjectTypes.js";
import { decodeEncryption, generateEncryption } from "../../utils/security/encryption.js";
import moment from "moment"; // 🔥 Import moment.js

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your first name"],
      minLength: 2,
      maxLength: 50,
      trim: true,
      validate: {
        validator: function (v) {
          if (v == "admin") {
            return false;
          } else if (v == "ADMIN") {
            throw new Error("ADMIN is not allowed");
          } else {
            return true;
          }
        },
        message: "firstName cant be admin",
      },
    },
    lastName: {
      type: String,
      required: [true, "Please enter your last name"],
      minLength: 2,
      maxLength: 20,
      trim: true,
      validate: {
        validator: function (v) {
          if (v == "admin") {
            return false;
          } else if (v == "ADMIN") {
            throw new Error("ADMIN is not allowed");
          } else {
            return true;
          }
        },
        message: "lastName cant be admin",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true, //not validator but its just query helper
    },
    tempEmail: String,
    password: {
      type: String,
    },
    gender: {
      type: String,
      enum: Object.values(genderTypes),
      default: genderTypes.male,
    },
    role: {
      type: String,
      enum: Object.values(roleTypes),
      default: roleTypes.user,
    },
    provider: {
      type: String,
      enum: Object.values(providerTypes),
      default: providerTypes.system,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    mobileNumber: String,
    profilePic: { secure_url: String, public_id: String },
    coverPic: [{ secure_url: String, public_id: String }],
    DOB: {
      type: String,
      // required: true,
      validate: {
        validator: function (value) {
          const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
          return age >= 18;
        },
        message: "User must be at least 18 years old.",
      },
    },
    deletedAt: Date,
    isDeleted: {
      type: Boolean,
    },
    bannedAt: Date,
    updatedBy: {
      type:Types.ObjectId,
      ref: "user",
    },
    OTP: [
      {
        code: String,
        type: {
          type: String,
          enum: Object.values(subjectTypes),
        },
        expiresIn: Date,
      },
    ],
    changeCredentialTime: Date,
    otpTrialCount: {
      type: Number,
      default: 0,
    },
    regenerateOtpTime: Date,
    twoStepVerificationFlag: {
      type: Boolean,
    },
    viewers: [{ userId: { type: Types.ObjectId, ref: "user" }, time: [Date] }],
    friends: [{type: Types.ObjectId, ref: "user" }],
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
// Virtual field for username  🔹, ✅, 🚀, ⚠, ❌, 📌, 🔥 ,😊,💪,🔍
userSchema.virtual("userName").set(function(value){
  this.firstName=value.split(" ")[0]
  this.lastName=value.split(" ")[1]

}).get(function() {
  return `${this.firstName} ${this.lastName}`;
});


// ✅ 📌 Hash password before saving
userSchema.pre('save',function(){
this.password=generateHash(this.password);
this.mobileNumber=generateEncryption(this.mobileNumber);
});

// 🔹 📌Pre-hook: Encrypt `mobileNumber` before updating if changed
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update?.mobileNumber) {
    update.mobileNumber = generateEncryption(update.mobileNumber);
    this.setUpdate(update);
  }
  next();
});

// 🔹 📌 Decrypt `mobileNumber` when retrieving user data
userSchema.post("findOne", async function (doc) {
  if (doc && doc.mobileNumber) {
    doc.mobileNumber = decodeEncryption(doc.mobileNumber); 
  }
});


// 🔥 **Method to check if user can be restored**
userSchema.methods.canRestore = function () {
  if (!this.deletedAt) return true; // ✅ User is not deleted
  return moment().diff(this.deletedAt, "years") < 1; // ❌ Block restore if more than 1 year
};


const userModel = mongoose.models.user|| model("user", userSchema);
export default userModel;

export const socketConnections= new Map();


