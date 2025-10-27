import * as Yup from "yup";
import {
  required,
  emailFormat,
  passwordPattern,
  confirmPasswordRule,
  phonePattern,
  dateOfBirth,
  minLength,
  maxLength,
  noMultipleSpaces,
  noExcessiveRepeats,
} from "./validationRules";

// Professional Info Schema
export const professionalSchema = Yup.object({
  industry: required("Industry is required")
    .concat(minLength(2))
    .concat(maxLength(50))
    .concat(noExcessiveRepeats(3))
    .concat(noMultipleSpaces()),
    

  reasonForJoining: required("Reason is required")
    .concat(minLength(5))
    .concat(maxLength(200))
    .concat(noMultipleSpaces()),
});

//Contact Info Schema
export const contactSchema = Yup.object({
  email: required("Email is required")
    .concat(emailFormat())
    .concat(maxLength(100))
    .concat(noExcessiveRepeats(3))
    .concat(noMultipleSpaces()),

  phone: required("Phone number is required").concat(phonePattern()),

  dateOfBirth: dateOfBirth(),
});

//Password Schema
export const passwordSchema = Yup.object({
  currentPassword: required("Current password is required"),
  newPassword: required("New password is required")
    .concat(passwordPattern())
    .concat(minLength(8))
    .concat(noExcessiveRepeats(3))
    .concat(maxLength(20)),
  confirmPassword: confirmPasswordRule(),
});

//Mentorship Schema
export const mentorshipSchema = Yup.object({
  bio: required("Bio is required").concat(minLength(10)).concat(maxLength(300)),
  availableSlots: Yup.array()
    .of(
      Yup.object({
        day: required("Day is required"),
        timeSlots: Yup.array()
          .of(Yup.string().required("Time slot required"))
          .min(1, "At least one time slot required"),
      })
    )
    .min(1, "At least one available slot required"),
});

export const getValidationSchema = (modalType: string) => {
  switch (modalType) {
    case "professional":
      return professionalSchema;
    case "contact":
      return contactSchema;
    case "password":
      return passwordSchema;
    case "mentorship":
      return mentorshipSchema;
    default:
      return null;
  }
};