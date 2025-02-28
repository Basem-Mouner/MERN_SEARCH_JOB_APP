import {GraphQLSchema,GraphQLObjectType, NoUnusedFragmentsRule} from "graphql";

import * as userMutationResolver from "./user/resolvers/mutationResolver/user.Mutation.resolver.js";
import * as userQueryResolver from "./user/resolvers/queryResolver/user.query.resolver.js";

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "MainSchemaQuery",
    description: "This is Query Include All project Endpoints",
    fields: {
      ...userQueryResolver,
    },
  }),
  mutation: new GraphQLObjectType({
    name: "MainSchemaMutation",
    description: "This is mutation Include All project Endpoints",
    fields: {
      ...userMutationResolver,
    },
  }),
});
