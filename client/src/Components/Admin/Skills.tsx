import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  addCategoryFailure,
  addCategoryStart,
} from "../../redux/Slice/categorySlice";
import { RootState } from "../../redux/store";
import { useParams } from "react-router-dom";

const AddSkillModal = ({
  isOpen,
  onClose,
  fetchSkills,
  parentCategoryId,
  parentSubCategoryId,
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.categories);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };
  const handleClose = () => {
    setName("");
    setDescription("");
    setImage(null);
    setPreview(null);
    onClose();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !image) {
      toast.error("All fields are required");
      return;
    }
    dispatch(addCategoryStart());
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("image", image);
      formData.append("categoryId", parentCategoryId);
      formData.append("subcategoryId", parentSubCategoryId);

      await axiosInstance.post(`admin/skills/create-skill`, formData);
      toast.success("Skill added successfully!");
      fetchSkills(parentSubCategoryId);
      handleClose(); // Close the modal
    } catch (error) {
      dispatch(
        addCategoryFailure(
          error.response?.data?.message || "Failed to add category"
        )
      );
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Add Skilly</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Name</label>
            <input
              type="text"
              id="name"
              className="border border-gray-300 rounded-md w-full p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              className="border border-gray-300 rounded-md w-full p-2"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Image</label>
            <input type="file" id="image" onChange={handleImageChange} />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded-md"
              />
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Skills = () => {
  // State to store categories
  const [skills, setSkills] = useState([]);
  const { categoryId, subcategoryId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editedSkill, setEditedSkill] = useState(null);

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
  // Handle Edit Click
  const handleEditClick = (subcategory) => {
    setEditingSkillId(subcategory._id);
    setEditedSkill({ ...subcategory }); // Set the current category for editing
  };

  // Handle Input Changes
  const handleInputChange = (e, field) => {
    setEditedSkill((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Handle Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEditedSkill((prev) => ({
      ...prev,
      image: file,
      preview: URL.createObjectURL(file),
    }));
  };

  // Handle Save
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editedSkill.name);
      formData.append("description", editedSkill.description);
      if (editedSkill.image) {
        formData.append("image", editedSkill.image);
      }

      console.log(formData);

      await axiosInstance.put(
        `/admin/skills/update-skill/${editingSkillId}`,
        formData
      );

      toast.success("Skills updated successfully!");
      fetchSkills(subcategoryId); // Refresh categories after update
      setEditingSkillId(null); // Exit edit mode
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    setEditingSkillId(null); // Exit edit mode
    setEditedSkill(null);
  };

  // Delete a subcategory
  const deleteSubCategory = async (id: string) => {
    toast((t) => (
      <div className="p-4">
        <p className="text-lg font-medium">
          Are you sure you want to delete this skill?
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => {
              confirmDeleteSkill(id);
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

  const confirmDeleteSkill = async (id: string) => {
    try {
      await axiosInstance.delete(`/admin/skills/delete-skill/${id}`);
      toast.success("Skill deleted successfully!");
      fetchSkills(subcategoryId); // Refresh categories after deletion
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete sub-category"
      );
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
            {skills.map((skill) => (
              <tr key={skill._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">
                  {editingSkillId === skill._id ? (
                    <>
                      <input type="file" onChange={handleImageChange} />
                      {editedSkill?.preview && (
                        <img
                          src={editedSkill.preview}
                          alt="Preview"
                          className="mt-2 w-16 h-16 object-cover rounded-md"
                        />
                      )}
                    </>
                  ) : (
                    <img
                      src={skill.imageUrl || "https://via.placeholder.com/100"}
                      alt={skill.name}
                      className="w-16 h-16 object-cover"
                    />
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingSkillId === skill._id ? (
                    <input
                      type="text"
                      value={editedSkill.name}
                      onChange={(e) => handleInputChange(e, "name")}
                      className="border border-gray-300 rounded-md w-full p-2"
                    />
                  ) : (
                    skill.name
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingSkillId === skill._id ? (
                    <textarea
                      value={editedSkill.description}
                      onChange={(e) => handleInputChange(e, "description")}
                      className="border border-gray-300 rounded-md w-full p-2"
                    />
                  ) : (
                    skill.description
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {editingSkillId === skill._id ? (
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
                        onClick={() => handleEditClick(skill)}
                        className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        onClick={() => deleteSubCategory(skill._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <AddSkillModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fetchSkills={fetchSkills}
          parentCategoryId={categoryId}
          parentSubCategoryId={subcategoryId}
        />
      </div>
    </div>
  );
};

export default Skills;
