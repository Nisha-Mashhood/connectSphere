import { useState } from "react";
import { Card, CardBody, Input, Button } from "@nextui-org/react";
import toast from "react-hot-toast";
import { updateUserPassword } from "../../../Service/User.Service";

const AdminInfoCard = ({ admin, onSave, saving }) => {
  const [form, setForm] = useState({
    name: admin.name,
    email: admin.email,
    jobTitle: admin.jobTitle,
    industry: admin.industry,
    reasonForJoining: admin.reasonForJoining,
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

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
    } catch (error) {
        console.log(error);
      toast.error("Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Card className="lg:col-span-2 shadow-lg border border-gray-200">
      <CardBody className="p-8 space-y-10">

        {/* === BASIC ADMIN INFO === */}
        <div className="grid sm:grid-cols-2 gap-6">
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            variant="bordered"
          />

          <Input
            label="Email"
            name="email"
            value={form.email}
            disabled
            variant="bordered"
          />

          <Input
            label="Job Title"
            name="jobTitle"
            value={form.jobTitle || ""}
            onChange={handleChange}
            variant="bordered"
          />

          <Input
            label="Industry"
            name="industry"
            value={form.industry || ""}
            onChange={handleChange}
            variant="bordered"
          />
        </div>

        <Input
          label="Reason for Joining"
          name="reasonForJoining"
          value={form.reasonForJoining || ""}
          onChange={handleChange}
          variant="bordered"
        />

        <Button
          color="primary"
          className="mt-4"
          isLoading={saving}
          onPress={() => onSave(form)}
        >
          Save Changes
        </Button>

        {/* === PASSWORD UPDATE SECTION === */}
        <div className="mt-10 border-t pt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Change Password
          </h2>

          <Input
            type="password"
            label="Old Password"
            name="oldPassword"
            value={passwordData.oldPassword}
            onChange={handlePasswordChange}
            variant="bordered"
          />

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <Input
              type="password"
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              variant="bordered"
            />

            <Input
              type="password"
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              variant="bordered"
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
