import { EventEmitter } from "node:events";
import { generateEmailTemplate,generateOtpTemplate, sendEmail } from "../email/sendEmail.js";
import { generateToken } from "../security/token/token.js";
import { generateOTPAlphabet } from "../OTP/otp.js";
import userModel from "../../DB/model/user.model.js";
import { generateHash } from "../security/hash.js";
import * as dbService from '../../DB/db.services.js'
import { subjectTypes } from "../../middleWare/types/subjectTypes.js";

//_______________________________________________________
export const emailEvent = new EventEmitter();
//_______________________________________________________
const sendCode = async ({ data, subject = subjectTypes.confirmEmail } = {}) => {
  const { id, email, userName } = data;
  
  

  const codeOtp = generateOTPAlphabet(process.env.TIMEOTPEXPIRE); // valid for 10 minutes
  const html = generateOtpTemplate(codeOtp.code, userName);

  let updateData = {};
   
  switch (subject) {
    case subjectTypes.confirmEmail:
      updateData = {
        // otp: generateHash(String(codeOtp.code)),
        // otpExpires: codeOtp.otpExpires,
        $push: {
          OTP: {
            code: generateHash(String(codeOtp.code)),
            type: subjectTypes.confirmEmail,
            expiresIn: codeOtp.otpExpires,
          },
        },
      };
      break;
    case subjectTypes.resetPassword:
      updateData = {
        $push: {
          OTP: {
            code: generateHash(String(codeOtp.code)),
            type: subjectTypes.resetPassword,
            expiresIn: codeOtp.otpExpires,
          },
        },
      };
      break;
    case subjectTypes.updateEmail:
      updateData = {
        // updatedEmailOtp: generateHash(String(codeOtp.code)),
        // updatedEmailOtpExpires: codeOtp.otpExpires,
        $push: {
          OTP: {
            code: generateHash(String(codeOtp.code)),
            type: subjectTypes.updateEmail,
            expiresIn: codeOtp.otpExpires,
          },
        },
      };
      break;
    case subjectTypes.twoStepVerification:
      updateData = {
        // twoStepVerificationOtp: generateHash(String(codeOtp.code)),
        // twoStepVerificationOtpExpires: codeOtp.otpExpires,
        $push: {
          OTP: {
            code: generateHash(String(codeOtp.code)),
            type: subjectTypes.twoStepVerification,
            expiresIn: codeOtp.otpExpires,
          },
        },
      };
      break;
      case subjectTypes.restoreAccount:
        updateData = {
          $push: {
            OTP: {
              code: generateHash(String(codeOtp.code)),
              type: subjectTypes.restoreAccount,
              expiresIn: codeOtp.otpExpires,
            },
          },
        };
        break;

    default:
      break;
  }

  
  //assign otp in user DB model
  await dbService.updateOne({
    model: userModel,
    filter: { _id:id },
    updateData,
  });


  await sendEmail({
    to: email,
    subject,
    html,
  });
};

//_______________________________________________________

//send otp to confirm email
emailEvent.on("sendConfirmEmailOtp", async (data) => {
  await sendCode({ data, subject: subjectTypes.confirmEmail });
});

//send otp to confirm email
emailEvent.on("sendUpdateEmailOtp", async (data) => {
  await sendCode({ data, subject: subjectTypes.updateEmail });
});


//send otp to confirm email
emailEvent.on("sendForgetPasswordOtp", async (data) => {
  await sendCode({ data, subject: subjectTypes.resetPassword });
});



//send otp to 2 step verification
emailEvent.on("send2StepVerificationOtp", async (data) => {
  await sendCode({ data, subject: subjectTypes.twoStepVerification });
});


//send otp to restore Account
emailEvent.on("restoreAccountOtp", async (data) => {
  await sendCode({ data, subject: subjectTypes.restoreAccount });
});





// await sendEmail({
//   to : ["basem.software@yahoo.com"],
//   cc : "",
//   bcc : "",
//   subject : "Hello ✔ confirm_Email",
//   text : "",
//   html : "",
//   attachments : [],
// })




//send link to confirm email
// emailEvent.on("sendEmail", async (data) => {
//   const { email, userName } = data;

//   const emailToken = generateToken({
//     payload: { email },
//     signature: process.env.EMAIL_TOKEN_SIGNATURE,
//   });

//   const emailLink = `https://${process.env.FRONTEND_LINK}/confirmEmail/${emailToken}`;
//   const html = generateEmailTemplate(emailLink, userName);

//   await sendEmail({
//     to: email,
//     html,
//   });
// });