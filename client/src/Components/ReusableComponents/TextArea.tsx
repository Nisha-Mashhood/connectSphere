import React from "react";
import { Textarea } from "@nextui-org/react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

const TextArea: React.FC<TextAreaProps> = ({
  label = "Text Area",
  placeholder,
  registration,
  error,
}) => {
  return (
    <div className="mt-4">
      {label && <label className="block text-gray-600 font-medium">{label}</label>}
      <Textarea
        {...registration}
        placeholder={placeholder}
        className="mt-2"
        classNames={{
          inputWrapper: [
            "bg-gray-200",
            "border",
            error ? "border-red-500" : "border-gray-300",
            "focus-within:border-blue-500",
            "focus-within:bg-white",
            "rounded-lg",
            "px-4",
            "py-2",
          ],
          input: ["text-base"],
        }}
      />
      {error && (
        <span className="text-red-500 text-sm mt-1 block">{error.message}</span>
      )}
    </div>
  );
};

export default TextArea;