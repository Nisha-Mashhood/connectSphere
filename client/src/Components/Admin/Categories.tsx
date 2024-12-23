import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import AddCategoryModal from "./AddCategoryModal";

const Categories = () => {
  // State to store categories
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editedCategory, setEditedCategory] = useState(null);

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/admin/category/get-categories");
      setCategories(response.data); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  // Handle Edit Click
  const handleEditClick = (category) => {
    setEditingCategoryId(category._id);
    setEditedCategory({ ...category }); // Set the current category for editing
  };

  // Handle Input Changes
  const handleInputChange = (e, field) => {
    setEditedCategory((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditedCategory((prev) => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };

  // Handle Save
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editedCategory.name);
      formData.append("description", editedCategory.description);
      if (editedCategory.image) {
        formData.append("image", editedCategory.image);
      }

      console.log(formData);

      await axiosInstance.put(`/admin/category/update-category/${editingCategoryId}`, formData);

      toast.success("Category updated successfully!");
      fetchCategories(); // Refresh categories after update
      setEditingCategoryId(null); // Exit edit mode
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setEditingCategoryId(null); // Exit edit mode
    setEditedCategory(null);
  };

  // Delete a category
  const deleteCategory = async (id) => {
    toast((t) => (
      <div className="p-4">
        <p className="text-lg font-medium">Are you sure you want to delete this category?</p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => {
              confirmDeleteCategory(id);
              toast.dismiss(t.id); // Dismiss the toast
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
      await axiosInstance.delete(`/admin/category/delete-category/${id}`);
      toast.success("Category deleted successfully!");
      fetchCategories(); // Refresh categories after deletion
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

   
  // Fetch categories when the component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Categories</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add Category
          </button>
        </div>

        <table className="table-auto border-collapse border border-gray-200 w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Image</th>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Description</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {editingCategoryId === category._id ? (
                    <>
                      <input type="file" onChange={handleImageChange} />
                      {editedCategory?.preview && (
                        <img
                          src={editedCategory.preview}
                          alt="Preview"
                          className="mt-2 w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </>
                  ) : (
                    <img
                      src={category.imageUrl || "https://via.placeholder.com/100"}
                      alt={category.name}
                      className="w-16 h-16 object-cover"
                    />
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingCategoryId === category._id ? (
                    <input
                      type="text"
                      value={editedCategory.name}
                      onChange={(e) => handleInputChange(e, "name")}
                      className="border border-gray-300 rounded-md w-full p-2"
                    />
                  ) : (
                    <Link to={`/admin/subcategories/${category._id}`}>
                    {category.name} </Link>           //HERE PASS CATEGORY ID TO THE SUBCATEGORY COMPONENT
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingCategoryId === category._id ? (
                    <textarea
                      value={editedCategory.description}
                      onChange={(e) => handleInputChange(e, "description")}
                      className="border border-gray-300 rounded-md w-full p-2"
                    />
                  ) : (
                    category.description
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingCategoryId === category._id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="border border-gray-300 px-4 py-2 flex gap-4">
                      <button
                      onClick={() => handleEditClick(category)}
                      className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600" onClick={() => deleteCategory(category._id)}>
                    Delete
                  </button>
                    </div>
                    
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <AddCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type='Category'
          fetch={fetchCategories}
        />
      </div>
    </div>
  );
};

export default Categories;
