import { useState } from "react";
import Breadcrumb from "../ReusableComponents/Breadcrumb";
import SearchBar from "../ReusableComponents/SearchBar";
import Pagination from "../ReusableComponents/Pagination";
import TableComponent from "./Table";
import FormModal from "./FormModal";
import {
  fetchCategoriesService,
  deleteCategory,
  updateCategory,
} from "../../Service/Category.Service";
import { ICategory } from "../../Interface/Admin/ICategory";
import { useCategoryTable } from "../../Hooks/Admin/useCategoryTable";

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ICategory | null>(null);

  const {
    items: categories,
    search,
    page,
    total,
    limit,
    loading,
    setPage,
    handleSearch,
    handleDelete,
    handleUpdate,
    handleCreate,
    handleUpdateLocal,
    refetch,
  } = useCategoryTable<ICategory>({
    fetchFn: fetchCategoriesService,
    deleteFn: deleteCategory,
    updateFn: updateCategory,
    parentId: undefined,
    createSuccess: (item) => console.log("Created:", item),
    updateSuccess: (item) => console.log("Updated:", item),
  });

  const handleOnClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <Breadcrumb items={[{ label: "Categories" }]} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Category
        </button>
      </div>

      <div className="mb-4">
        <SearchBar
          activeTab="Categories"
          searchQuery={search}
          setSearchQuery={handleSearch}
          onSearchChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading…</div>
      ) : (
        <>
          <TableComponent
            type="Category"
            datas={categories}
            headers={["Image", "Name", "Description", "Actions"]}
            updateData={handleUpdate}
            deleteData={handleDelete}
            onEdit={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
          />

          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      <FormModal
        isOpen={isModalOpen}
        onClose={handleOnClose}
        type="Category"
        fetch={refetch}
        isEdit={!!editingItem}
        item={editingItem}
        update={handleUpdate}
        onSuccess={editingItem ? handleUpdateLocal : handleCreate}
      />
    </div>
  );
};

export default Categories;