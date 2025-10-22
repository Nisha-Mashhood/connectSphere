import React from "react";
import { FieldError } from "react-hook-form";
import toast from "react-hot-toast";

interface FileInputProps {
  label?: string;
  name: string;
  setValue: (name: string, value: unknown) => void;
  error?: FieldError;
  accept?: string;
  previewUrl?: string | null;
  previewClassName?: string;
}

const FileInput: React.FC<FileInputProps> = ({
  label = "File Upload",
  name,
  setValue,
  error,
  accept = "image/jpeg,image/png,image/jpg",
  previewUrl,
  previewClassName,
}) => {
  const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validImageTypes.includes(file.type)) {
        setValue(name, file);
        const previewUrl = URL.createObjectURL(file);
        setValue(`${name}Preview`, previewUrl);
      } else {
        setValue(name, null);
        toast.error("Only JPEG, JPG, and PNG images are allowed");
      }
    }
  };

  return (
    <div className="mt-4">
      {label && <label className="block text-gray-600 font-medium">{label}</label>}
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="w-full py-2 mt-2"
      />
      {error && (
        <span className="text-red-500 text-sm mt-1 block">{error.message}</span>
      )}
      {previewUrl && (
        <img
          src={previewUrl}
          alt={`${label} Preview`}
          className={previewClassName || "mt-4 w-full h-32 object-cover rounded-lg border"}
        />
      )}
    </div>
  );
};

export default FileInput;