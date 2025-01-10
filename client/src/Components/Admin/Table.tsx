import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaPencilAlt, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';

const TableComponent = ({
  type,
  datas,
  headers,
  updateData,
  deleteData,
  categoryId = null,
}) => {
  const [editingdataId, setEditingdataId] = useState(null);
  const [editeddata, setEditeddata] = useState(null);

  const handleEditClick = (item) => {
    setEditingdataId(item._id);
    setEditeddata({ ...item });
  };

  const handleInputChange = (e, field) => {
    setEditeddata((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditeddata((prev) => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const handleCancel = () => {
    setEditingdataId(null);
    setEditeddata(null);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editeddata.name);
      formData.append("description", editeddata.description);
      if (editeddata.image) {
        formData.append("image", editeddata.image);
      }

      updateData(editingdataId, formData);
      setEditingdataId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const deletedata = async (id) => {
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

  const confirmDeleteCategory = async (id) => {
    try {
      deleteData(id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

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
              key={item._id}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <td className="border-b border-gray-200 px-6 py-4">
                {editingdataId === item._id ? (
                  <>
                    <input type="file" onChange={handleImageChange} />
                    {editeddata?.preview && (
                      <img
                        src={editeddata.preview}
                        alt="Preview"
                        className="mt-2 w-16 h-16 object-cover rounded-md"
                      />
                    )}
                  </>
                ) : (
                  <img
                    src={item.imageUrl || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className="w-16 h-16 object-cover"
                  />
                )}
              </td>
              <td className="border-b border-gray-200 px-6 py-4">
                {editingdataId === item._id ? (
                  <input
                    type="text"
                    value={editeddata.name}
                    onChange={(e) => handleInputChange(e, "name")}
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                ) : type === "Category" ? (
                  <Link
                    to={`/admin/subcategories/${item._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : type === "Subcategory" ? (
                  <Link
                    to={`/admin/skills/${categoryId}/${item._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span>{item.name}</span>
                )}
              </td>
              <td className="border-b border-gray-200 px-6 py-4">
                {editingdataId === item._id ? (
                  <textarea
                    value={editeddata.description}
                    onChange={(e) => handleInputChange(e, "description")}
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                ) : (
                  item.description
                )}
              </td>
              <td className="border-b border-gray-200 px-6 py-4">
                {editingdataId === item._id ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="px-2 py-2  bg-gray-300 text-white rounded-md hover:bg-green-600 mr-2"
                    >
                      <FaSave className="h-2 w-2" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-2 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-red-600"
                    >
                      <FaTimes className="h-2 w-2" />
                    </button>
                  </>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="px-2 py-2  bg-gray-300 text-white rounded-md hover:bg-blue-600"
                    >
                      <FaPencilAlt className="h-2 w-2" />
                    </button>
                    <button
                      onClick={() => deletedata(item._id)}
                      className="px-2 py-2  bg-gray-300 text-white rounded-md hover:bg-red-600"
                    >
                      <FaTrashAlt className="h-2 w-2" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;