import * as Yup from "yup";
import {
  required,
  minLength,
  maxLength,
  noMultipleSpaces,
  noExcessiveRepeats,
  noStartingSpecialChar,
  imageFile,
} from "./validationRules";

export interface CategoryFormValues {
  name: string;
  description: string;
  image: File | null;
  imageFile?: File | null;
  imageUrl?: string;
}

export const addCategorySchema = Yup.object({
  name: required("Name is required")
    .concat(minLength(3, "Name must be at least 3 characters"))
    .concat(maxLength(50, "Name cannot exceed 50 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .concat(noStartingSpecialChar()),

  description: required("Description is required")
    .concat(minLength(10, "Description must be at least 10 characters"))
    .concat(maxLength(500, "Description cannot exceed 500 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),

  image: imageFile(2), 
});

export const editCategorySchema = Yup.object({
  name: required("Name is required")
    .concat(minLength(3, "Name must be at least 3 characters"))
    .concat(maxLength(50, "Name cannot exceed 50 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .concat(noStartingSpecialChar()),

  description: required("Description is required")
    .concat(minLength(10, "Description must be at least 10 characters"))
    .concat(maxLength(500, "Description cannot exceed 500 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),

});