
import path from 'path';
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve('./src/config/.env.dev') });
import cloudinary from "cloudinary";

  // Configuration
 cloudinary.v2.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.API_KEY,
   api_secret: process.env.API_SECRET,
 });
  
export const cloud = cloudinary.v2;
 
