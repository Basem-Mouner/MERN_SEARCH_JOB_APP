import cron from "node-cron";
import userModel from "../DB/model/user.model.js";
import * as dbService from "../DB/db.services.js";
// 🔥 CRON Job to delete expired OTPs every 6 hours
// CRON Job to delete expired OTPs every 6 hours
// Remove expired OTPs from user documents
// The CRON schedule "0 */6 * * *" means:
// 0 → Run at minute 0 (the start of the hour)
// */6 → Every 6 hours
// * * * → Every day, every month, and every day of the week.
// It removes OTP objects from all users where expiresIn is less than the current date.


export default function startCronJobs() {
  cron.schedule("0 */6 * * *", async () => {
    try {
      console.log("🔹 Running CRON Job: Deleting expired OTPs...");
  await dbService.updateMany({
    model:userModel,
    filter:{},
    updateData:{ $pull: { OTP: { expiresIn: { $lt: new Date() } } } },
      
  })
  
      console.log("✅ Expired OTPs deleted successfully.");
    } catch (error) {
      console.error("❌ Error while deleting expired OTPs:", error.message);
    }
  });
}
