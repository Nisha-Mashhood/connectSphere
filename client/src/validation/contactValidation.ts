import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
  emailFormat,
} from "./validationRules";

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

export const contactSchema = Yup.object({
  name: required("Name is required")
    .concat(minLength(2, "Name must be at least 2 characters"))
    .concat(maxLength(50, "Name cannot exceed 50 characters")),

  email: required("Email is required")
    .concat(emailFormat()),

  message: required("Message is required")
    .concat(minLength(10, "Message must be at least 10 characters"))
    .concat(maxLength(1000, "Message cannot exceed 1000 characters")),
}).required();