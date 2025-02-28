import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";



// Enums (assuming these are predefined elsewhere in your code)
const genderTypes = new GraphQLEnumType({
    name: "Gender",
    values: {
        male: { value: "male" },
        female: { value: "female" }
    }
  });
  
  const roleTypes = new GraphQLEnumType({
    name: "Role",
    values: {
        user: { value: "user" },
        admin: { value: "admin" },
      superAdmin: { value: "super_admin" }
    }
  });
  
  const providerTypes = new GraphQLEnumType({
    name: "Provider",
    values: {
      google: { value: "google" },
      system: { value: "system" }
    }
  });
//__________________________________________________________________
  export const imageType = new GraphQLObjectType({
    name: "attachmentsType",
    fields: {
      secure_url: { type: GraphQLString },
      public_id: { type: GraphQLString },
    },
  });

  export const otpType = new GraphQLObjectType({
    name: "otpType",
    fields: {
      code: { type: GraphQLString },
      type: { type: GraphQLString },
      expiresIn: { type: GraphQLString },
    }
  })
//__________________________________________________________________
export const userType = new GraphQLObjectType({
  name: "userType",
  fields: {
    _id: { type: GraphQLID },
    userName: { type: GraphQLString},
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    tempEmail: { type: GraphQLString },
    password: { type: GraphQLString },
    OTP: { type: new GraphQLList(otpType) },
    otpTrialCount: { type: GraphQLInt },
    isDeleted: { type: GraphQLBoolean },
    deletedAt: { type: GraphQLString },
    bannedAt: { type: GraphQLString },
    profilePic: { type: imageType },
    coverPic: { type: new GraphQLList(imageType) },
    mobileNumber: { type: GraphQLString },
    gender:  { type: genderTypes },
    role:  { type: roleTypes },
    provider: { type: providerTypes },
    confirmEmail: { type: GraphQLBoolean },
    changeCredentialsTime: { type: GraphQLString },
    DOB: { type: GraphQLString },
    twoStepVerificationFlag: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  },
});

export const companyType = new GraphQLObjectType({
  name: "companyType",
  fields: {
    _id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString }, // 📌 Example: "Mental Health Care"
    address: { type: GraphQLString },
    numberOfEmployees: { type: new GraphQLList(GraphQLInt) }, // 🔹 Array with [min, max]
    companyEmail: { type: GraphQLString },
    createdBy: { type: userType }, // 🔹 Populated user object
    logo: { type: imageType }, // ✅ Image type for logo
    coverPic: { type: imageType }, // ✅ Image type for coverPic
    HRs: { type: new GraphQLList(userType) }, // 🔹 Populate HRs with user details
    bannedAt: { type: GraphQLString },
    isDeleted: { type: GraphQLBoolean },
    deletedAt: { type: GraphQLString },
    legalAttachment:{type: new GraphQLObjectType({
      name: "LegalAttachment",
      fields: {
        secure_url: { type: GraphQLString },
        public_id: { type: GraphQLString },
        fileType: { type: GraphQLString }, // 🔹 "pdf" or "image"
      },
    }),},
    approvedByAdmin: { type: GraphQLBoolean }, // ✅ Default: Not approved
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});

//__________________________________________________________________
export const userList=new GraphQLList(userType);
export const companyList=new GraphQLList(companyType);
//__________________________________________________________________
export const userProfileResponse = new GraphQLObjectType({
  name: "userProfileResponse",
  fields: {
    statusCode: { type: GraphQLInt },
    message: { type: GraphQLString },
    data: { type: userType },
  },
});
//__________________________________________________________________
//__________________________________________________________________

export const allUserAndCompanyResponse = new GraphQLObjectType({
  name: "allUserAndCompanyResponse",
  fields: {
    statusCode: { type: GraphQLInt },
    message: { type: GraphQLString },
    users: { type: new GraphQLList(userType) }, // ✅ Ensure users are included
    companies: { type: new GraphQLList(companyType) }, // ✅ Ensure companies are included
  }
 
})



















// export const userType = new GraphQLObjectType({
//   name: "userType",
//   fields: {
//     _id: { type: GraphQLID },
//     userName: { type: GraphQLString},
//     firstName: { type: GraphQLString },
//     lastName: { type: GraphQLString },
//     email: { type: GraphQLString },
//     tempEmail: { type: GraphQLString },
//     password: { type: GraphQLString },
//     phone: { type: GraphQLString },
//     otp: { type: GraphQLString },
//     otpExpires: { type: GraphQLString },
//     otpTrialCount: { type: GraphQLInt },
//     forgetPasswordOtp: { type: GraphQLString },
//     forgetPasswordOtpExpires: { type: GraphQLString },
//     updatedEmailOtp: { type: GraphQLString },
//     updatedEmailOtpExpires: { type: GraphQLString },
//     isDeleted: { type: GraphQLBoolean },
   
//     profilePic: { type: imageType },
//     coverPic: { type: new GraphQLList(imageType) },
//     mobileNumber: { type: GraphQLString },
    
//     gender:  { type: genderTypes },
//     role:  { type: roleTypes },
//     provider: { type: providerTypes },
//     confirmEmail: { type: GraphQLBoolean },
//     isDeleted: { type: GraphQLBoolean },
//     changeCredentialsTime: { type: GraphQLString },
//     phone: { type: GraphQLString },
//     image:{ type: imageType},
//     coverImage: {type: new GraphQLList(imageType)},
//     DOB: { type: GraphQLString },
//     twoStepVerificationFlag: { type: GraphQLBoolean },
//     twoStepVerificationOtp: { type: GraphQLString },
//     twoStepVerificationOtpExpires: { type: GraphQLString },
//     createdAt: { type: GraphQLString },
//     updatedAt: { type: GraphQLString }
//   },
// });