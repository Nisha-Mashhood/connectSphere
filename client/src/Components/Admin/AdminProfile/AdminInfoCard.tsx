import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, CardBody, Input, Button } from "@nextui-org/react";
import toast from "react-hot-toast";
import { updateUserPassword } from "../../../Service/User.Service";
import {
  AdminProfileFormValues,
  adminProfileSchema,
} from "../../../validation/adminProfileValidation";
import { useState } from "react";

const AdminInfoCard = ({ admin, onSave, saving }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminProfileFormValues>({
    resolver: yupResolver(adminProfileSchema),
    defaultValues: {
      name: admin.name,
      email: admin.email,
      jobTitle: admin.jobTitle || "",
      industry: admin.industry || "",
      reasonForJoining: admin.reasonForJoining || "",
    },
  });

  const onSubmit = (data: AdminProfileFormValues) => {
    onSave(data);
  };
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  //Password Updation
  const handlePasswordUpdate = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      return toast.error("All password fields are required");
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setPasswordLoading(true);
    try {
      await updateUserPassword(admin.id, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password updated successfully");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      toast.error("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Card className="lg:col-span-2 shadow-lg border border-gray-200">
      <CardBody className="p-8 space-y-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Name"
              variant="bordered"
              {...register("name")}
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />

            <Input
              label="Email"
              variant="bordered"
              disabled
              {...register("email")}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />

            <Input
              label="Job Title"
              variant="bordered"
              {...register("jobTitle")}
              isInvalid={!!errors.jobTitle}
              errorMessage={errors.jobTitle?.message}
            />

            <Input
              label="Industry"
              variant="bordered"
              {...register("industry")}
              isInvalid={!!errors.industry}
              errorMessage={errors.industry?.message}
            />
          </div>

          <Input
            label="Reason for Joining"
            variant="bordered"
            {...register("reasonForJoining")}
            isInvalid={!!errors.reasonForJoining}
            errorMessage={errors.reasonForJoining?.message}
          />

          <Button color="primary" className="mt-4" isLoading={saving} type="submit">
            Save Changes
          </Button>
        </form>

        {/* ===== PASSWORD UPDATE SECTION ===== */}
        <div className="mt-10 border-t pt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Change Password
          </h2>

          <Input
            type="password"
            label="Old Password"
            variant="bordered"
            value={passwordData.oldPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, oldPassword: e.target.value })
            }
          />

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <Input
              type="password"
              label="New Password"
              variant="bordered"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
            />

            <Input
              type="password"
              label="Confirm New Password"
              variant="bordered"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
            />
          </div>

          <Button
            color="secondary"
            className="mt-6"
            isLoading={passwordLoading}
            onPress={handlePasswordUpdate}
          >
            Update Password
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default AdminInfoCard;
