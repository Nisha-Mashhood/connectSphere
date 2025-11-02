import * as Yup from "yup";
import {
  required,
  emailFormat,
  maxLength,
  minLength,
  noMultipleSpaces,
  noExcessiveRepeats,
  passwordPattern,
  noSequentialRepeatedDigits,
  noSequentialRepeatedLetters,
  noStartingSpecialChar,
} from "./validationRules";

export interface LoginFormValues {
  email: string;
  password: string;
}

export const loginSchema = Yup.object({
  email: required("Email is required")
    .concat(emailFormat())
    .concat(maxLength(100, "Email cannot exceed 100 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .trim(),

  password: required("Password is required")
    .concat(minLength(8, "Password must be at least 8 characters long"))
    .concat(maxLength(20, "Password cannot exceed 20 characters"))
    .concat(passwordPattern())
    .concat(noSequentialRepeatedDigits())
    .concat(noSequentialRepeatedLetters())
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .concat(noStartingSpecialChar()),
});