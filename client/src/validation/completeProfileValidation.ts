import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
  emailFormat,
  namePattern,
  noMultipleSpaces,
  noExcessiveRepeats,
  phonePattern,
  dateOfBirth,
} from "./validationRules";

export const completeProfileSchema = Yup.object({
  name: required("Full Name is required")
    .concat(minLength(2, "Name must be at least 2 characters"))
    .concat(maxLength(50, "Name cannot exceed 50 characters"))
    .concat(namePattern())
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),

  email: required("Email is required")
    .concat(emailFormat())
    .concat(maxLength(100, "Email cannot exceed 100 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),

  phone: required("Phone number is required").concat(phonePattern()),

  dateOfBirth: dateOfBirth(),

  jobTitle: required("Job Title is required")
    .concat(minLength(2, "Job Title must be at least 2 characters"))
    .concat(maxLength(50, "Job Title cannot exceed 50 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),

  industry: required("Industry is required")
    .concat(minLength(2, "Industry must be at least 2 characters"))
    .concat(maxLength(50, "Industry cannot exceed 50 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),

  reasonForJoining: required("Reason for Joining is required")
    .concat(minLength(10, "Reason must be at least 10 characters"))
    .concat(maxLength(500, "Reason cannot exceed 500 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),

  profilePic: Yup.mixed<File>()
    .nullable()
    .optional()
    .test(
      "file-type",
      "Only JPEG, JPG, and PNG images are allowed",
      (value) => !value || ["image/jpeg", "image/png", "image/jpg"].includes((value as File).type)
    ),

  coverPic: Yup.mixed<File>()
    .nullable()
    .optional()
    .test(
      "file-type",
      "Only JPEG, JPG, and PNG images are allowed",
      (value) => !value || ["image/jpeg", "image/png", "image/jpg"].includes((value as File).type)
    ),

  profilePicPreview: Yup.string().nullable().optional(),
  coverPicPreview: Yup.string().nullable().optional(),
});

export type CompleteProfileFormValues = Yup.InferType<typeof completeProfileSchema>;