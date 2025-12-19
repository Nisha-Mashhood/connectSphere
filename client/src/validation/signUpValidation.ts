import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
  emailFormat,
  noMultipleSpaces,
  namePattern,
  passwordPattern,
  noSequentialRepeatedDigits,
  noSequentialRepeatedLetters,
  noNameInPassword,
  noEmailInPassword,
  noStartingSpecialChar,
  noExcessiveRepeats,
  noUppercaseEmail,
} from "./validationRules.ts"; 

export interface SignupFormValues {
  name: string;
  email: string;
  password: string;
}

export const signupSchema = Yup.object({
  name: required("Full name is required")
    .concat(namePattern())
    .concat(minLength(3, "Name must be at least 3 characters long"))
    .concat(maxLength(50, "Name cannot exceed 50 characters"))
    .concat(noMultipleSpaces())
    .concat(noStartingSpecialChar())
    .concat(noExcessiveRepeats(3)),

  email: required("Email is required")
    .concat(emailFormat())
    .concat(noUppercaseEmail())
    .concat(maxLength(100, "Email cannot exceed 100 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .trim(),

  password: required("Password is required")
    .concat(passwordPattern())
    .concat(minLength(8, "Password must be at least 8 characters long"))
    .concat(maxLength(20, "Password cannot exceed 20 characters"))
    .concat(noSequentialRepeatedDigits())
    .concat(noSequentialRepeatedLetters())
    .concat(noNameInPassword())
    .concat(noEmailInPassword())
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .concat(noStartingSpecialChar()),
});