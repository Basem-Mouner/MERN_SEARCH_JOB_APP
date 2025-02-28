import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(process.env.DB_URI_ATLAS, {
      serverSelectionTimeoutMS: 50000, //default 30000ms
    })
    .then((res) => console.log("DB connected"))
    .catch((err) => console.log("Fail to connect to DB", err));
};
