import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import AddModal from "./AddModal";
import TableComponent from "./Table";
import { deleteSkill, fetchSkillsService, updateSkill } from "../../Service/Category.Service";

const Skills = () => {
  // State to store categories
  const [skills, setSkills] = useState([]);
  const { categoryId, subcategoryId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch categories from the backend
  const fetchSkills = async (subcategoryId: string) => {
    try {
      const data = await fetchSkillsService(subcategoryId);
      setSkills(data); 
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle Save
  const handleUpdate = async (editingSkillId, formData) => {
    try {
      await updateSkill(editingSkillId, formData);
      toast.success("Skill updated successfully!");
      fetchSkills(subcategoryId); // Refresh skill after update
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSkill(id);
      toast.success("Skill deleted successfully!");
      fetchSkills(subcategoryId); // Refresh skill after delete
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  // Fetch categories when the component mounts
  useEffect(() => {
    if (categoryId) {
      fetchSkills(subcategoryId);
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
            Add Skills
          </button>
        </div>

        <TableComponent
          type="Skill"
          datas={skills}
          headers={["Image", "Name", "Description", "Actions"]}
          updateData={handleUpdate}
          deleteData={handleDelete}
        />

        <AddModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          type="skill"
          fetch={fetchSkills}
          categoryId={categoryId}
          subcategoryId={subcategoryId}
        />
      </div>
    </div>
  );
};

export default Skills;
