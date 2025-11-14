import { useCallback, useEffect, useState } from "react";
import { Spinner, Button } from "@nextui-org/react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminProfileCard from "./AdminProfile/AdminProfileCard";
import AdminInfoCard from "./AdminProfile/AdminInfoCard";
import { getAdminById } from "../../Service/Admin.Service";
import { updateAdminProfile } from "../../Service/Admin.Service";
import { useDispatch } from "react-redux";
import { updateAdminProfile as updateAdminProfileAction } from "../../redux/Slice/userSlice";
import { User } from "../../redux/types";

const AdminProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { adminId } = useParams();
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Fetch details
  const fetchAdminDetails = useCallback(async () => {
    try {
      const response = await getAdminById(adminId!);
      setAdmin(response.userDetails);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch admin details");
    } finally {
      setLoading(false);
    }
  }, [adminId]);

  useEffect(() => {
    fetchAdminDetails();
  }, [fetchAdminDetails]);

  //Update Details
  const handleSave = async (updatedData: Record<string, string>) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      if (selectedImage) {
        formData.append("profilePic", selectedImage);
      }

      const updated = await updateAdminProfile(adminId!, formData);
      dispatch(updateAdminProfileAction(updated.user));
      setAdmin(updated.user);
      toast.success("Profile updated successfully!");
      setSelectedImage(null);
    } catch {
      toast.error("Failed to update admin profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-danger">Admin not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          color="primary"
          variant="light"
          onPress={() => navigate(-1)}
          startContent={<FaArrowLeft />}
          className="mb-6 shadow-md"
        >
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <AdminProfileCard admin={admin} onImageSelect={setSelectedImage} />
          <AdminInfoCard admin={admin} onSave={handleSave} saving={saving} />
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
