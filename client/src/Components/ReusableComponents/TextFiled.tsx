import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface TextFieldProps {
  label: string;
  description?: string;
  type?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  description,
  type = "text",
  placeholder,
  registration,
  error,
}) => {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

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

      <div className="relative mt-2">
        <input
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-12 rounded-lg bg-gray-200 border ${
            error ? "border-red-500" : "border-gray-300"
          } focus:border-blue-500 focus:bg-white focus:outline-none`}
          {...registration}
        />

        {/* Eye Icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>

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

export default TextField;
