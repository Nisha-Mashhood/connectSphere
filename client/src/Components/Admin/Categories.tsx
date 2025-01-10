import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableComponent from "./Table";
import AddCategoryModal from "./AddModal";
import { deleteCategory, fetchCategoriesService, updateCategory } from "../../Service/Category.Service";

const Categories = () => {
  // State to store categories
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const data = await fetchCategoriesService();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle Save
  const handleUpdate = async (editingCategoryId, formData) => {
    try {
      await updateCategory(editingCategoryId, formData);
      toast.success("Category updated successfully!");
      fetchCategories(); // Refresh categories after update
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully!");
      fetchCategories(); // Refresh categories after delete
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

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

        {/* Pass categories and fetchCategories to the TableComponent */}
        <TableComponent
          type="Category"
          datas={categories}
          headers={["Image", "Name", "Description", "Actions"]}
          updateData={handleUpdate}
          deleteData={handleDelete}
        />
        <AddCategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type="Category"
          fetch={fetchCategories} // Pass fetchCategories to refresh data
        />
      </div>
    </div>
  );
};

export default Categories;
