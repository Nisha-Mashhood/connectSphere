import { useParams } from "react-router-dom";
import { useState } from "react";
import TableComponent from "./Table";
import FormModal from "./FormModal";
import SearchBar from "../ReusableComponents/SearchBar";
import Pagination from "../ReusableComponents/Pagination";
import Breadcrumb from "../ReusableComponents/Breadcrumb";
import {
  fetchSkillsService,
  deleteSkill,
  updateSkill,
} from "../../Service/Category.Service";
import { ISkill } from "../../Interface/Admin/ISkill";
import { useCategoryTable } from "../../Hooks/Admin/useCategoryTable";

const Skills = () => {
  const { categoryId, subcategoryId } = useParams<{
    categoryId: string;
    subcategoryId: string;
  }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ISkill | null>(null);

  const {
    items: skills,
    search,
    page,
    total,
    limit,
    setPage,
    handleSearch,
    handleDelete,
    handleUpdate,
    handleCreate,
    handleUpdateLocal,
    refetch,
  } = useCategoryTable<ISkill>({
    fetchFn:fetchSkillsService,
    deleteFn: deleteSkill,
    updateFn: updateSkill,
    parentId: subcategoryId,
  });

  const handleEditOpen = (item: ISkill) => {
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
          { label: "Sub-Categories", to: `/admin/subcategories/${categoryId}` },
          { label: "Skills" },
        ]}
      />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Skills</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Add Skill
        </button>
      </div>

      <div className="mb-4">
        <SearchBar
          activeTab="Skills"
          searchQuery={search}
          setSearchQuery={() => {}}
          onSearchChange={handleSearch}
        />
      </div>

      <TableComponent
        type="Skill"
        datas={skills}
        headers={["Image", "Name", "Description", "Actions"]}
        updateData={handleUpdate}
        deleteData={handleDelete}
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
        type="skill"
        fetch={refetch}
        categoryId={categoryId}
        subcategoryId={subcategoryId}
        isEdit={!!editingItem}
        item={editingItem}
        update={handleUpdate}
        onSuccess={editingItem ? handleUpdateLocal : handleCreate}
      />
    </div>
  );
};

export default Skills;