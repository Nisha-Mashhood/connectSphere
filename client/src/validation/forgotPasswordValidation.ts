import * as Yup from "yup";
import {
  required,
  emailFormat,
  maxLength,
  noMultipleSpaces,
  noExcessiveRepeats,
  noStartingSpecialChar,
} from "./validationRules";

export interface ForgotPasswordFormValues {
  email: string;
}

export const forgotPasswordSchema = Yup.object({
  email: required("Email is required")
    .concat(emailFormat())
    .concat(maxLength(100, "Email cannot exceed 100 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .concat(noStartingSpecialChar())
    .trim(),
});