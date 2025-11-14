import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
  noMultipleSpaces,
  namePattern,
  noStartingSpecialChar,
  noExcessiveRepeats,
} from "./validationRules";

export interface AdminProfileFormValues {
  name: string;
  email: string;
  jobTitle: string;
  industry: string;
  reasonForJoining: string;
}

export const adminProfileSchema = Yup.object({
  name: required("Name is required")
    .concat(namePattern())
    .concat(minLength(3))
    .concat(maxLength(20))
    .concat(noMultipleSpaces())
    .concat(noStartingSpecialChar())
    .concat(noExcessiveRepeats(3)),

  email: required("Email is required"),

  jobTitle: Yup.string()
    .required("jobTitle is required")
    .max(50, "Job title cannot exceed 50 characters")
    .concat(noMultipleSpaces())
    .concat(noStartingSpecialChar())
    .concat(noExcessiveRepeats(3)),

  industry: Yup.string()
    .required("Industry is required")
    .max(50, "Industry cannot exceed 50 characters")
    .concat(noMultipleSpaces())
    .concat(noStartingSpecialChar())
    .concat(noExcessiveRepeats(3)),

  reasonForJoining: Yup.string()
    .optional()
    .max(100, "Maximum 100 characters allowed")
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),
})
