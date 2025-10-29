import { FieldError, UseFormRegisterReturn } from "react-hook-form";

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
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } focus:border-blue-500 focus:bg-white focus:outline-none`}
        {...registration}
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

export default TextField;