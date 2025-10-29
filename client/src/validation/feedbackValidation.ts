import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
} from "./validationRules";

export interface FeedbackFormValues {
  rating: number;
  communication: number;
  expertise: number;
  punctuality: number;
  comments: string;
  wouldRecommend: boolean;
}

const ratingRule = (fieldName: string) =>
  Yup.number()
    .typeError(`${fieldName} is required`)
    .required(`${fieldName} is required`)
    .min(1, `${fieldName} must be at least 1`)
    .max(5, `${fieldName} cannot exceed 5`)
    .integer(`${fieldName} must be a whole number`);

export const feedbackSchema = Yup.object({
  rating: ratingRule("Overall Rating"),
  communication: ratingRule("Communication"),
  expertise: ratingRule(
    "Expertise/Engagement"
  ),
  punctuality: ratingRule("Punctuality"),

  comments: required("Comments are required")
    .concat(minLength(10, "Comments must be at least 10 characters"))
    .concat(maxLength(500, "Comments cannot exceed 500 characters")),

  wouldRecommend: Yup.boolean()
    .required("Please indicate if you would recommend")
    .oneOf([true, false], "Please select Yes or No"),
}).required();