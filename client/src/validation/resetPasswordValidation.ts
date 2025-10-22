import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
  passwordPattern,
  noSequentialRepeatedDigits,
  noSequentialRepeatedLetters,
  noMultipleSpaces,
  noExcessiveRepeats,
  noStartingSpecialChar,
  noEmailInPassword,
  confirmPasswordRule,
  mustMatchEmail,
} from "./validationRules";

export interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
  email: string;
}

export const resetPasswordSchema = (email: string) =>
  Yup.object({
    newPassword: required("Password is required")
      .concat(minLength(8, "Password must be at least 8 characters long"))
      .concat(maxLength(20, "Password cannot exceed 20 characters"))
      .concat(passwordPattern())
      .concat(noSequentialRepeatedDigits())
      .concat(noSequentialRepeatedLetters())
      .concat(noMultipleSpaces())
      .concat(noExcessiveRepeats(3))
      .concat(noStartingSpecialChar())
      .concat(noEmailInPassword()),

      confirmPassword: required("Please confirm your password")
      .concat(confirmPasswordRule()) 
      .concat(noEmailInPassword()),

      email: mustMatchEmail(email),
  });