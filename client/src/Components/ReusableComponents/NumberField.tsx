import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface NumberFieldProps {
  label: string;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  registration: UseFormRegisterReturn;
  error?: FieldError;
}

const NumberField: React.FC<NumberFieldProps> = ({
  label,
  description,
  placeholder,
  min,
  max,
  registration,
  error,
}) => (
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
      type="number"
      placeholder={placeholder}
      min={min}
      max={max}
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

export default NumberField;
