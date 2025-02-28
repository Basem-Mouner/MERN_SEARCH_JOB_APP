import { roleTypes } from "../../middleWare/types/roleTypes.js";


export const endPoint = {
  // profile: Object.values(roleTypes)
  profile: [...Object.values(roleTypes)],
  admin: [roleTypes.admin],
};