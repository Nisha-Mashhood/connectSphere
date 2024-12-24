import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import AddModal from "./AddModal";
import TableComponent from "./Table";

const Skills = () => {
  // State to store categories
  const [skills, setSkills] = useState([]);
  const { categoryId, subcategoryId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch categories from the backend
  const fetchSkills = async (subcategoryId: string) => {
    try {
      const response = await axiosInstance.get(
        `/admin/skills/get-skills/${subcategoryId}`
      );
      console.log(response);
      setSkills(response.data); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle Save
  const handleUpdate = async (editingSkillId, formData) => {
    try {
      const response = await axiosInstance.put(
        `/admin/skills/update-skill/${editingSkillId}`,
        formData
      );
      toast.success("Skill updated successfully!");
      fetchSkills(subcategoryId); // Refresh skill after update
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/skills/delete-skill/${id}`
      );
      toast.success("Skill deleted successfully!");
      fetchSkills(subcategoryId); // Refresh skill after delete
      return response;
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
