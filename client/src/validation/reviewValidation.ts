import * as Yup from "yup";
import { required, minLength } from "./validationRules";

export interface ReviewFormValues {
  rating: number;
  comments: string;
}

export const reviewSchema = Yup.object({
  rating: Yup.number()
    .typeError("Please select a star rating")
    .required("Please select a star rating")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .integer("Rating must be a whole number"),

  comments: required("Comments are required")
    .concat(minLength(10, "Comments must be at least 10 characters"))
    .max(500, "Comments cannot exceed 500 characters"),
}).required();