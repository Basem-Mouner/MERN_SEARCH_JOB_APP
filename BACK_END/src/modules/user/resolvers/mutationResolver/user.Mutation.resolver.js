import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import * as dbService from "../../../../DB/db.services.js";

// import * as postType from '../types/posts.types.js'
import {
  authentication_Graph,
  authorization_Graph,
} from "../../../../middleWare/auth.qraphql.middleware .js";
import { roleTypes } from "../../../../middleWare/types/roleTypes.js";
import { validation_graph } from "../../../../middleWare/validation.middleware.js";

import { companyType, userType } from "../../types/user.types.js";
import userModel from "../../../../DB/model/user.model.js";
import companyModel from "../../../../DB/model/company.model.js";
import {
  ApproveCompanyGraph,
  banCompanyGraph,
  banUserGraph,
} from "../../user.validation.js";

//🔥 GraphQL Mutation: Ban/Unban User
export const banOrUnbanUser = {
  type: new GraphQLObjectType({
    name: "BanOrUnbanUserResponse",
    fields: {
      statusCode: { type: GraphQLInt },
      message: { type: GraphQLString },
      user: { type: userType },
    },
  }),
  args: {
    authorization: { type: new GraphQLNonNull(GraphQLString) }, // ✅ Admin Token Required
    userId: { type: new GraphQLNonNull(GraphQLString) }, // ✅ User to Ban/Unban
  },
  resolve: async (parent, args) => {
    validation_graph({ Schema: banUserGraph, inputData: args });
    // ✅ Authenticate & Check Admin Role
    const adminUser = await authentication_Graph({
      authorization: args.authorization,
    });
    authorization_Graph({
      role: adminUser.role,
      accessRole: [roleTypes.admin, roleTypes.superAdmin],
    }); // 🚀 Ensure Only Admins Can Ban/Unban

    // 🔍 Find User
    const user = await dbService.findById({
      model: userModel,
      id: args.userId,
    });
    if (!user) {
      throw new Error("❌ User not found!");
    }

    const messageResponse = user.bannedAt==undefined
    ? "✅ User Banned Successfully!"
    : "✅ User Unbanned Successfully!";
  
    // 🔄 Toggle Ban Status
    const newBanStatus = user.bannedAt
      ? { $unset: { bannedAt: 0 } }
      : { bannedAt: new Date() };
     await dbService.findByIdAndUpdate({
      model: userModel,
      id: args.userId,
      updateData: newBanStatus,
    });

    return {
      statusCode: 200,
      message: messageResponse,
      user,
    };
  },
};
//🔥 GraphQL Mutation: Ban/Unban Company
export const banOrUnbanCompany = {
  type: new GraphQLObjectType({
    name: "BanOrUnbanCompanyResponse",
    fields: {
      statusCode: { type: GraphQLInt },
      message: { type: GraphQLString },
      company: { type: companyType },
    },
  }),
  args: {
    authorization: { type: new GraphQLNonNull(GraphQLString) }, // ✅ Admin Token Required
    companyId: { type: new GraphQLNonNull(GraphQLString) }, // ✅ Company to Ban/Unban
  },
  resolve: async (parent, args) => {
    validation_graph({ Schema: banCompanyGraph, inputData: args });
    // ✅ Authenticate & Check Admin Role
    const adminUser = await authentication_Graph({
      authorization: args.authorization,
    });
    authorization_Graph({
      role: adminUser.role,
      accessRole: [roleTypes.admin, roleTypes.superAdmin],
    }); // 🚀 Ensure Only Admins Can Ban/Unban

    // 🔍 Find Company
    const company = await dbService.findById({
      model: companyModel,
      id: args.companyId,
    });
    if (!company) {
      throw new Error("❌ Company not found!");
    }

    // 🔄 Toggle Ban Status
    const newBanStatus = company.bannedAt ? null : new Date();
    company.bannedAt = newBanStatus;
    await company.save();

    return {
      statusCode: 200,
      message: newBanStatus
        ? "✅ Company Banned Successfully!"
        : "✅ Company Unbanned Successfully!",
      company,
    };
  },
};
//🔥 GraphQL Mutation: Approve Company
export const approveCompany = {
  type: new GraphQLObjectType({
    name: "ApproveCompanyResponse",
    fields: {
      statusCode: { type: GraphQLInt },
      message: { type: GraphQLString },
      company: { type: companyType },
    },
  }),
  args: {
    authorization: { type: new GraphQLNonNull(GraphQLString) }, // ✅ Admin Token Required
    companyId: { type: new GraphQLNonNull(GraphQLString) }, // ✅ Company to Approve
  },
  resolve: async (parent, args) => {
    validation_graph({ Schema: ApproveCompanyGraph, inputData: args });
    // ✅ Authenticate & Check Admin Role
    const adminUser = await authentication_Graph({
      authorization: args.authorization,
    });
    authorization_Graph({
      role: adminUser.role,
      accessRole: [roleTypes.admin, roleTypes.superAdmin],
    }); // 🚀 Ensure Only Admins Can Approve

    // 🔍 Find Company
    const company = await dbService.findById({
      model: companyModel,
      id: args.companyId,
    });
    if (!company) {
      throw new Error("❌ Company not found!");
    }

    // 🔄 Approve Company
    if (company.approvedByAdmin) {
      throw new Error("⚠️ Company is already approved!");
    }
    company.approvedByAdmin = true;
    await company.save();

    return {
      statusCode: 200,
      message: "✅ Company Approved Successfully!",
      company,
    };
  },
};
