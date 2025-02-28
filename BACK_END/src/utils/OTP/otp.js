import { customAlphabet, nanoid } from "nanoid";


export const generateOTP = (expireTimeBySec=5) => {
  const otp = {
    code: nanoid(5), // Generate a 5-character OTP  or customAlphabet("0123456789",4)
    otpExpires: Date.now() + expireTimeBySec * 60 * 1000, // Expires in 5 minutes
  };
  return otp;
};

//======================================================================
export const generateOTPAlphabet = (expireTimeByMin = 5) => {
  const otp = {
    code: customAlphabet("0123456789", 4)(),
    otpExpires: Date.now() + expireTimeByMin * 60 * 1000, // Expires in 5 minutes by default
  };
  return otp;
};
//=========================================================================
