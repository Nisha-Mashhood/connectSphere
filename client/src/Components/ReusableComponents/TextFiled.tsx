import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  type = "text",
  placeholder,
  registration,
  error,
}) => {
  return (
    <div className="mt-4">
      <label className="block text-gray-700">{label}</label>
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