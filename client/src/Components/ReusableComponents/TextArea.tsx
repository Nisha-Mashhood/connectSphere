import React from "react";
import { Textarea } from "@nextui-org/react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextAreaProps {
  label?: string;
  description?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

const TextArea: React.FC<TextAreaProps> = ({
  label = "Text Area",
  description,
  placeholder,
  registration,
  error,
}) => {
  return (
    <div className="mt-4">
     <label className="block font-medium">
        {label}
        {description && (
          <span className="block text-sm font-normal text-gray-600 mt-1">
            {description}
          </span>
        )}
      </label>
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