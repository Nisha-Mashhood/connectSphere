import React from 'react';
import { InputOtp } from "@nextui-org/input-otp";
import { FieldError } from "react-hook-form";

interface InputOTPProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: FieldError;
  length?: number;
}

const InputOTP: React.FC<InputOTPProps> = ({
  label = "Verification Code",
  value,
  onValueChange,
  error,
  length = 6,
}) => {
  return (
    <div className="mt-4">
      {label && <label className="block text-gray-700">{label}</label>}
      <InputOtp
        length={length}
        value={value}
        onValueChange={onValueChange}
        classNames={{
          segmentWrapper: [
            "bg-gray-200",
            "border",
            error ? "border-red-500" : "border-gray-300",
            "focus-within:border-blue-500",
            "focus-within:bg-white",
            "rounded-lg",
            "px-2",
            "py-1",
          ],
          input: ["text-center", "text-base"],
        }}
      />
      {error && (
        <div
          className="text-red-600 text-sm"
          style={{ minHeight: "1.5em", marginTop: "0.25rem" }}
        >
          {error.message}
        </div>
      )}
    </div>
  );
};

export default InputOTP;