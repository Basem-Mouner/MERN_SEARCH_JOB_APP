import * as bcrypt from "bcrypt";

export const generateHash = (plainText="",salt=parseInt(process.env.SALT_ROUND)) => {
  const Hash = bcrypt.hashSync(plainText,salt);
  return Hash;
};

export const compareHash = (plainText="",hashValue="") => {
  const match = bcrypt.compareSync(plainText, hashValue);
  console.log(match);
  
  return match;
};