import * as Yup from "yup";
import { required, minLength } from "./validationRules";

export interface AdminLoginFormValues {
  email: string;
  password: string;
  role: "admin";
}

export const adminLoginSchema = Yup.object({
  email: required("Email is required")
    .email("Invalid email address")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),

  password: required("Password is required")
    .concat(minLength(8, "Password must be at least 8 characters")),

  role: Yup.mixed<"admin">().oneOf(["admin"]).required(),
}).required();