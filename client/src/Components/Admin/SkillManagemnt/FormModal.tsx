import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import {
  createCategory,
  createSkill,
  createSubCategory,
} from "../../../Service/Category.Service";

import TextField from "../../ReusableComponents/TextFiled";
import TextArea from "../../ReusableComponents/TextArea";
import { ICategory } from "../../../Interface/Admin/ICategory";
import { ISubCategory } from "../../../Interface/Admin/ISubCategory";
import { ISkill } from "../../../Interface/Admin/ISkill";
import { baseSchema, FormValues } from "../../../validation/categoryValidation";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "Category" | "sub-category" | "skill";
  fetch: ((id?: string) => void) | (() => void);
  categoryId?: string | null;
  subcategoryId?: string | null;
  isEdit?: boolean;
  item?: ICategory | ISubCategory | ISkill;
  update?: (id: string, formData: FormData) => Promise<void>;
  onSuccess?: (item: ICategory | ISubCategory | ISkill) => void;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  type,
  categoryId = null,
  subcategoryId = null,
  isEdit = false,
  item = null,
  update = null,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(baseSchema),
  });

  useEffect(() => {
    if (isOpen && isEdit && item) {
      reset({
        name: item.name ?? "",
        description: item.description ?? "",
      });
      setPreview(item.imageUrl ?? null);
      setImageFile(null);
    } else if (isOpen && !isEdit) {
      reset({ name: "", description: "" });
      setPreview(null);
      setImageFile(null);
    }
  }, [isOpen, isEdit, item, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Only JPEG and PNG images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2 MB");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const getParentIds = () => {
    let parentCategoryId: string | null = null;
    let parentSubcategoryId: string | null = null;

    if (type === "sub-category" || type === "skill") {
      parentCategoryId =
        categoryId ?? (item as ISubCategory | ISkill)?.categoryId ?? null;
    }

    if (type === "skill") {
      parentSubcategoryId =
        subcategoryId ?? (item as ISkill)?.subcategoryId ?? null;
    }

    return { parentCategoryId, parentSubcategoryId };
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!imageFile && !isEdit) {
      toast.error("Image is required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      if (imageFile) formData.append("image", imageFile);

      const { parentCategoryId, parentSubcategoryId } = getParentIds();
      if (parentCategoryId) formData.append("categoryId", parentCategoryId);
      if (parentSubcategoryId)
        formData.append("subcategoryId", parentSubcategoryId);

      let result: ICategory | ISubCategory | ISkill;

      if (isEdit) {
        await update(item.id, formData);
        result = { ...item, ...data, imageUrl: preview || item.imageUrl };
      } else {
        if (type === "Category") {
          result = await createCategory(formData);
        } else if (type === "sub-category") {
          result = await createSubCategory(formData);
        } else if (type === "skill") {
          result = await createSkill(formData);
        }
      }
      handleClose();
      onSuccess?.(result);
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setPreview(null);
    setImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  const modalTitle = isEdit ? `Edit ${type}` : `Add ${type}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-5 text-2xl font-bold text-gray-800">{modalTitle}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextField
            label="Name"
            placeholder="Enter name"
            registration={register("name")}
            error={errors.name}
          />

          <TextArea
            label="Description"
            placeholder="Enter description (min 10 chars)"
            registration={register("description")}
            error={errors.description}
          />

          <div className="mt-4">
            <label className="block font-medium">
              Image{" "}
              {isEdit && (
                <span className="text-sm font-normal text-gray-600">
                  (optional – leave blank to keep current)
                </span>
              )}
            </label>

            <div className="mt-2 flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
              >
                {preview ? "Change Image" : "Choose Image"}
              </label>
              {imageFile && (
                <span className="text-sm text-gray-600">{imageFile.name}</span>
              )}
            </div>

            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-32 rounded-md border object-cover shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-md bg-gray-300 px-5 py-2 text-gray-700 transition hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? isEdit
                  ? "Edit…"
                  : "Create…"
                : isEdit
                ? "Edit"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
