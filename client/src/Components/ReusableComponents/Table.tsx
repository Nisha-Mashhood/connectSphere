import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { ICategory } from "../../Interface/Admin/ICategory";
import { ISubCategory } from "../../Interface/Admin/ISubCategory";
import { ISkill } from "../../Interface/Admin/ISkill";

interface TableComponentProps {
  type: string;
  datas: ICategory[] | ISubCategory[] | ISkill[];
  headers: string[];
  updateData: (id: string, formData: FormData) => Promise<void>;
  deleteData: (id: string) => Promise<void>;
  categoryId?: string;
  onEdit: (item: ICategory | ISubCategory | ISkill) => void; 
}

const TableComponent = ({
  type,
  datas,
  headers,
  deleteData,
  categoryId,
  onEdit,
}: TableComponentProps) => { 

  const deletedata = async (id: string) => {
    toast((t) => (
      <div className="p-4">
        <p className="text-lg font-medium">
          Are you sure you want to delete this {type}?
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => {
              confirmDeleteCategory(id);
              toast.dismiss(t.id); 
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  const confirmDeleteCategory = async (id: string) => {
    try {
      await deleteData(id);
    } catch (error) {
      toast.error((error).response?.data?.message || `Failed to delete ${type}`);
    }
  };

  if (datas.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No {type.toLowerCase()}s yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto max-w-full">
      <table className="min-w-full bg-white border border-gray-200 rounded-md shadow-md">
        <thead>
          <tr className="bg-gray-100">
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datas.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="border-b border-gray-200 px-6 py-4">
                <img
                  src={item.imageUrl || "https://via.placeholder.com/100"}
                  alt={`${item.name} image`}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </td>
              <td className="border-b border-gray-200 px-6 py-4">
                {type === "Category" ? (
                  <Link
                    to={`/admin/subcategories/${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : type === "Subcategory" ? (
                  <Link
                    to={`/admin/skills/${categoryId}/${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span>{item.name}</span>
                )}
              </td>
              <td className="border-b border-gray-200 px-6 py-4">
                {item.description}
              </td>
              <td className="border-b border-gray-200 px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    aria-label={`Edit ${item.name}`}
                  >
                    <FaPencilAlt className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deletedata(item.id)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    aria-label={`Delete ${item.name}`}
                  >
                    <FaTrashAlt className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;