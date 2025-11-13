import React from "react";
import { Spinner, Button } from "@nextui-org/react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserDetails } from "../../../Hooks/Admin/useUserDetails";
import UserProfileCard from "./UserProfileCard";
import UserInfoCard from "./UserInfoCard";
import PasskeyModal from "./PasskeyModal";


const UserDetails: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    loading,
    isPasskeyModalOpen,
    setIsPasskeyModalOpen,
    passkey,
    setPasskey,
    updateUserRole,
    handlePasskeySubmit,
  } = useUserDetails();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-danger">User not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            color="primary"
            variant="light"
            onPress={() => navigate("/admin/user")}
            startContent={<FaArrowLeft />}
            className="mb-6 shadow-md"
          >
            Back to Users
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <UserProfileCard user={user} updateUserRole={updateUserRole} />
            <UserInfoCard user={user} />
          </div>
        </div>
      </div>

      <PasskeyModal
        isOpen={isPasskeyModalOpen}
        onClose={() => {
          setIsPasskeyModalOpen(false);
          setPasskey("");
        }}
        passkey={passkey}
        setPasskey={setPasskey}
        onSubmit={handlePasskeySubmit}
      />
    </>
  );
};

export default UserDetails;