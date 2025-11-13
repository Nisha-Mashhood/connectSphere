import * as Yup from "yup";
import { required, emailFormat, minLength } from "./validationRules";

export const contactReplySchema = Yup.object().shape({
  email: emailFormat().required("Email is required"),
  replyMessage: required("Reply message is required").concat(
    minLength(5, "Reply must be at least 5 characters")
  ),
});
