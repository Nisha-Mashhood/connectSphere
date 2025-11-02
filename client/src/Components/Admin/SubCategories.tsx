import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import TableComponent from "./Table";
import { useParams } from "react-router-dom";
import AddModal from "./AddModal";
import { deleteSubCategory, fetchSubCategoriesService, updateSubCategory } from "../../Service/Category.Service";


const SubCategories = () => {
  // State to store categories
  const [subcategories, setSubCategories] = useState([]);
  const { categoryId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  const handleEditOpen = (item) => {
  setEditingItem(item);
  console.log(item);
  toast.success("edit was pressed")
  setIsEditModalOpen(true);
};

  // Fetch categories from the backend
  const fetchSubCategories =  useCallback(async (categoryId: string) => {
    try {
      const data = await fetchSubCategoriesService(categoryId);
      console.log(data);
      setSubCategories(data); 
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  },[]);
  
  // Handle Save
  const handleUpdate = async (editingsubCategoryId, formData) => {
    try {
      await updateSubCategory(editingsubCategoryId, formData);
      toast.success("Sub-Category updated successfully!");
      fetchSubCategories(categoryId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update sub-category");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubCategory(id);
      toast.success("sub-category deleted successfully!");
      fetchSubCategories(categoryId); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };
  // Fetch sub-categories when the component mounts
  useEffect(() => {
    if (categoryId) {
      fetchSubCategories(categoryId);
    }
  }, [categoryId]);

  return (
    <div>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Sub-Categories</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Add Sub-Category
          </button>
        </div>

        {/* Pass sub categories to the TableComponent */}
        <TableComponent
          type="Subcategory"
          datas={subcategories}
          headers={["Image", "Name", "Description", "Actions"]}
          updateData={handleUpdate}
          deleteData={handleDelete}
          categoryId={categoryId}
          onEdit={handleEditOpen}
        />
        <AddModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type='sub-category'
          fetch={fetchSubCategories}
          categoryId={categoryId}
        />
      </div>
    </div>
  );
};

export default SubCategories;
