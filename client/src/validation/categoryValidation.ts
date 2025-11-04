import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
  noMultipleSpaces,
  noExcessiveRepeats,
  noStartingSpecialChar,
  noSequentialRepeatedLetters,
} from "./validationRules"; 

export interface FormValues {
  name: string;
  description: string;
}
export const baseSchema = Yup.object({
  name: required()
    .concat(minLength(3))
    .concat(maxLength(20))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .concat(noStartingSpecialChar())
    .concat(noSequentialRepeatedLetters()),
  description: required()
    .concat(minLength(10))
    .concat(maxLength(300))
    .concat(noMultipleSpaces())
    .concat(noStartingSpecialChar()),
});