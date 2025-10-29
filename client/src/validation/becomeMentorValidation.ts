import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
  noMultipleSpaces,
  noExcessiveRepeats,
  noStartingSpecialChar,
  priceRule,
  atLeastOneSlot,
  fileUploadRule,
} from "./validationRules";

export interface BecomeMentorFormValues {
  specialization: string;
  bio: string;
  price: number;
  timePeriod: number;
  skills: string[];
  certificates: File[];
  availableSlots: { day?: string; timeSlots?: string[] }[];
}

export const becomeMentorSchema: Yup.ObjectSchema<BecomeMentorFormValues> = Yup.object({
  specialization: required("Specialization is required")
    .concat(minLength(3, "Specialization must be at least 3 characters"))
    .concat(maxLength(50, "Specialization cannot exceed 50 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .concat(noStartingSpecialChar()),

  bio: required("Bio is required")
    .concat(minLength(10, "Bio must be at least 10 characters"))
    .concat(maxLength(500, "Bio cannot exceed 500 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),

  price: priceRule(0, 100_000),

  timePeriod: Yup.number()
    .typeError("Number of sessions must be a number")
    .required("Number of sessions is required")
    .min(5, "Minimum 5 sessions")
    .max(25, "Maximum 25 sessions")
    .integer("Must be a whole number"),

  skills: Yup.array()
    .of(Yup.string().required("Skill is required"))
    .min(1, "At least one skill is required")
    .max(10, "You can add up to 10 skills")
    .required("Skills are required"),

  certificates: fileUploadRule(1, 2),

  availableSlots: atLeastOneSlot().required(),
}).required();