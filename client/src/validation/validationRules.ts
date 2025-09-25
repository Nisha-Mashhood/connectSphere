import * as Yup from "yup";

export const required = (message = "This field is required") =>
  Yup.string().required(message);

export const minLength = (min: number, message?: string) =>
  Yup.string().min(min, message || `Minimum ${min} characters`);

export const maxLength = (max: number, message?: string) =>
  Yup.string().max(max, message || `Maximum ${max} characters`);

export const emailFormat = () => Yup.string().email("Invalid email format");

export const noMultipleSpaces = () =>
  Yup.string().test(
    "no-multiple-spaces",
    "Cannot contain multiple consecutive spaces",
    (value) => !/\s{2,}/.test(value || "")
  );

export const noExcessiveRepeats = (limit: number = 2) =>
  Yup.string().test(
    "no-excessive-repeats",
    `Cannot contain a character repeated more than ${limit} times in a row`,
    (value) => !new RegExp(`(.)\\1{${limit},}`).test(value || "")
  );

export const noStartingSpecialChar = () =>
  Yup.string().test(
    "no-starting-special-char",
    "Cannot start with a special character",
    (value) => !/^[^A-Za-z0-9]/.test(value || "")
  );

export const namePattern = () =>
  Yup.string().matches(/^[A-Za-z ]+$/, "Only alphabets and spaces allowed");

export const passwordPattern = () =>
  Yup.string().matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
    "Must include uppercase, lowercase, number, special char"
  );

export const noSequentialRepeatedDigits = () =>
  Yup.string().test(
    "no-seq-repeated-digits",
    "Cannot contain sequential repeated digits",
    (value) => !/(\d)\1{2,}/.test(value || "")
  );

export const noSequentialRepeatedLetters = () =>
  Yup.string().test(
    "no-seq-repeated-letters",
    "Cannot contain sequential repeated letters",
    (value) => !/([A-Za-z])\1{2,}/.test(value || "")
  );

export const noNameInPassword = () =>
  Yup.string().test(
    "no-name-in-password",
    "Password cannot contain your name",
    function (value) {
      const { name } = this.parent;
      return !value.includes(name?.trim());
    }
  );

export const noEmailInPassword = () =>
  Yup.string().test(
    "no-email-in-password",
    "Password cannot contain email parts",
    function (value) {
      const { email } = this.parent;
      return !value.includes(email?.split("@")[0]);
    }
  );

export const priceRule = (min: number = 1, max: number = 100000) =>
  Yup.number()
    .typeError("Price must be a number")
    .required("Price is required")
    .min(min, `Price must be at least ${min}`)
    .max(max, `Price cannot exceed ${max}`);

export const fileUploadRule = (minFiles: number = 2, maxFiles: number = 5) =>
  Yup.array()
    .of(Yup.mixed().required("File is required"))
    .min(minFiles, `At least ${minFiles} files required`)
    .max(maxFiles, `Cannot upload more than ${maxFiles} files`);
