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
  futureDate,
  intBetween,
} from "./validationRules";

export interface Slot {
  day?: string;
  timeSlots?: string[];
}

export interface GroupFormValues {
  name: string;
  bio: string;
  price: number;
  maxMembers: number;
  availableSlots: Slot[];
  startDate: string;
}

export const createGroupSchema: Yup.ObjectSchema<GroupFormValues> = Yup.object({
  name: required("Group name is required")
    .concat(minLength(3, "Group name must be at least 3 characters"))
    .concat(maxLength(50, "Group name cannot exceed 50 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3))
    .concat(noStartingSpecialChar()),

  bio: required("Bio is required")
    .concat(minLength(10, "Bio must be at least 10 characters"))
    .concat(maxLength(500, "Bio cannot exceed 500 characters"))
    .concat(noMultipleSpaces())
    .concat(noExcessiveRepeats(3)),

  price: priceRule(0, 100_000),

  maxMembers: intBetween(2, 4, "Maximum members"),

  availableSlots: atLeastOneSlot().required(),

  startDate: futureDate(),
}).required(); 
