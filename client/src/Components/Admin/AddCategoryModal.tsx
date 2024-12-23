import toast from "react-hot-toast";
import { axiosInstance } from "../../lib/axios";
import { useState } from "react";

const AddModal = ({ isOpen, onClose, type, fetch, categoryId=null, subcategoryId=null }) => {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
  
    const ValidateForm = () => {
      if (!name.trim()) {
        toast.error("Name is required and cannot be empty");
        return false;
      }
  
      if (name.length < 3) {
        toast.error("Name must be at least 3 characters long");
        return false;
      }
  
      if (!description.trim()) {
        toast.error("Description is required and cannot be empty");
        return false;
      }
  
      if (description.length < 10) {
        toast.error("Description must be at least 10 characters long");
        return false;
      }
  
      if (!image) {
        toast.error("Image is required");
        return false;
      }
  
      const validImageTypes = ["image/jpeg", "image/png"];
      if (!validImageTypes.includes(image.type)) {
        toast.error("Only JPEG and PNG images are allowed");
        return false;
      }
  
      return true;
    };
  
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
      
        const success = ValidateForm();
        if (!success) return;
      
        setLoading(true);
      
        try {
          const formData = new FormData();
          formData.append("name", name);
          formData.append("description", description);
          formData.append("image", image);
      
          // Handle different types
          if (type === 'Category') {
            await axiosInstance.post("admin/category/create-category", formData);
            fetch();
            handleClose();
          } else if (type === 'sub-category') {
            formData.append("categoryId", categoryId);
            await axiosInstance.post("admin/subcategory/create-subcategory", formData);
            fetch(categoryId);
            handleClose();
          } else if (type === 'skill') {
            formData.append("categoryId", categoryId);
            formData.append("subcategoryId", subcategoryId);
            await axiosInstance.post("admin/skills/create-skill", formData);
            fetch(subcategoryId);
            handleClose();
          }
          // After success, perform common actions
          setLoading(false);
          toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);      
        } catch (error) {
          setLoading(false);
          toast.error(error.response?.data?.message || `Failed to add ${type.charAt(0).toUpperCase() + type.slice(1)} `);
        }
      };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Add {type}</h2>
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
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default AddModal;
  