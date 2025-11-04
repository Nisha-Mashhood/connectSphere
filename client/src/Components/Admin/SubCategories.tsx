import { useParams } from "react-router-dom";
import { useState } from "react";
import TableComponent from "./Table";
import FormModal from "./FormModal";
import SearchBar from "../ReusableComponents/SearchBar";
import Pagination from "../ReusableComponents/Pagination";
import Breadcrumb from "../ReusableComponents/Breadcrumb";
import {
  fetchSubCategoriesService,
  deleteSubCategory,
  updateSubCategory,
} from "../../Service/Category.Service";
import { ISubCategory } from "../../Interface/Admin/ISubCategory";
import { useCategoryTable } from "../../Hooks/Admin/useCategoryTable";

const SubCategories = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ISubCategory | null>(null);

  const {
      items: subcategories,
      page,
      total,
      setPage,
      search,
      limit,
      handleSearch,
      handleDelete,
      handleUpdate,
      handleCreate,
      handleUpdateLocal,
      refetch,
    } = useCategoryTable<ISubCategory>({
      fetchFn: fetchSubCategoriesService,
      deleteFn: deleteSubCategory,
      updateFn: updateSubCategory,
      parentId: categoryId,
      createSuccess: (newItem) => console.log("Created:", newItem),
      updateSuccess: (updated) => console.log("Updated:", updated),
    });

  const handleEditOpen = (item: ISubCategory) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOnClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Breadcrumb
        items={[
          { label: "Categories", to: "/admin/categories" },
          { label: "Sub-Categories" },
        ]}
      />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sub-Categories</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Sub-Category
        </button>
      </div>

      <div className="mb-4">
        <SearchBar
          activeTab="Sub-Categories"
          searchQuery={search}
          setSearchQuery={() => {}}
          onSearchChange={handleSearch}
        />
      </div>

      <TableComponent
        type="Subcategory"
        datas={subcategories}
        headers={["Image", "Name", "Description", "Actions"]}
        updateData={handleUpdate}
        deleteData={handleDelete}
        categoryId={categoryId}
        onEdit={handleEditOpen}
      />

      <Pagination
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />

      <FormModal
        isOpen={isModalOpen}
        onClose={handleOnClose}
        type="sub-category"
        fetch={refetch}
        categoryId={categoryId}
        isEdit={!!editingItem}
        item={editingItem}
        update={handleUpdate}
        onSuccess={editingItem ? handleUpdateLocal : handleCreate}
      />
    </div>
  );
};

export default SubCategories;