import * as Yup from "yup";

export interface OTPFormValues {
  otp: string;
}

export const otpSchema = Yup.object({
  otp: Yup.string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .matches(/^[0-9]+$/, "OTP must only contain digits"),
});