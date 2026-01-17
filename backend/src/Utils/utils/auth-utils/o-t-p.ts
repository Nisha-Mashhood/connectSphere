import { SendOtpParams } from "../../types/auth-types";
import { saveOtpToRedis } from "./otp-redis-helper";
import { sendEmail } from "../../../core/utils/email";

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

export const sendOtpAndStore = async (
  params: SendOtpParams
): Promise<string> => {
  const {
    email,
    purpose,
    emailSubject,
    emailBody,
    ttlSeconds = 300,
  } = params;

  const normalizedEmail: string = email.toLowerCase().trim();
  // const todayDate = new Date();
  

  const otp: string = generateOTP();    //generate otp
  const otpId: string = await saveOtpToRedis(    //save to redis
    {
      otp,
      email: normalizedEmail,
      purpose,
      attempts: 0,
      createdAt: Date.now(),
    },
    ttlSeconds
  );
  await sendEmail(  //send email
    normalizedEmail,
    emailSubject,
    emailBody(otp)
  );

  console.log("OTP SENT SUCCESSFULLY :",otp)

  return otpId;
};