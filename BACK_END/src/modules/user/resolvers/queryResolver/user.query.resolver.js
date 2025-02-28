
import userModel from '../../../../DB/model/user.model.js';
import * as userTypes from '../../types/user.types.js';
import * as dbService from '../../../../DB/db.services.js';
import { authentication_Graph, authorization_Graph } from '../../../../middleWare/auth.qraphql.middleware .js';
import { roleTypes } from '../../../../middleWare/types/roleTypes.js';
import { GraphQLNonNull, GraphQLString } from 'graphql';
import companyModel from '../../../../DB/model/company.model.js';


export const profile = {
    type:userTypes.userProfileResponse,
    args: {
        authorization: {type:new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args) => {

        const user = await authentication_Graph({authorization: args.authorization});
         authorization_Graph({role:user.role,accessRole:[...Object.values(roleTypes)]});

        return { statusCode: 200, message: "success", data: user };
    }
}

//============================================================================
export const dashboard  = {
    type:userTypes.allUserAndCompanyResponse,
    args: {
        authorization: {type:new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args) => {

        const user = await authentication_Graph({authorization: args.authorization});
         authorization_Graph({role:user.role,accessRole:[...Object.values(roleTypes)]});

         const data = await Promise.allSettled([
            dbService.findAll({model: userModel,filter: {}}),
            dbService.findAll({model: companyModel,filter: {}}),
          ]);

          
          return {
             statusCode: 200,
              message: "success",
             users: data[0].status === "fulfilled" ? data[0].value : [], 
             companies: data[1].status === "fulfilled" ? data[1].value : [],
            };

        
    }
}
//============================================================================

