import nodemailer from "nodemailer";
import { confirmEmailTemplateDesign } from "../templates/confirmEmail.js";
import { otpTemplateDesign } from "../templates/otpEmail.template.js";

export const generateEmailTemplate = (emailLink, userName) => {
  return confirmEmailTemplateDesign(emailLink, userName);
};

export const generateOtpTemplate = ( otp,userName) => {
  return otpTemplateDesign(otp, userName);
};


export const sendEmail = async ({
  to = [],
  cc = [],
  bcc = [],
  subject = "Hello ✔ confirm_Email",
  text = "Hello ✔",
  html,
  attachments = [],
} = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_HOST,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // async..await is not allowed in global scope, must use a wrapper

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `${process.env.EMAIL_NAMED_FROM} <${process.env.EMAIL_HOST}>`, // sender address
    to, // list of receivers array of mail as string ar string contain all of strings mail
    cc,
    bcc,
    subject, // Subject line
    text, // plain text body
    html, // html body
    attachments,
  });

  // console.log("Message sent: %s", info.messageId);
  // // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>

  return info;
};

// await sendEmail({
//   to : ["basem.software@yahoo.com"],
//   cc : "",
//   bcc : "",
//   subject : "Hello ✔ confirm_Email",
//   text : "",
//   html : "",
//   attachments : [],
// })
