import { Card, CardBody, Avatar, Button } from "@nextui-org/react";

const AdminProfileCard = ({ admin, onImageSelect }) => {
  return (
    <Card className="h-fit shadow-lg border border-gray-200">
      <CardBody className="p-8 text-center space-y-6">
        <Avatar
          src={admin.profilePic}
          className="w-40 h-40 text-large mx-auto"
          isBordered
          color="primary"
        />

        <input
          type="file"
          accept="image/*"
          hidden
          id="profile-upload"
          onChange={(e) => onImageSelect(e.target.files?.[0] || null)}
        />

        <Button as="label" htmlFor="profile-upload" color="secondary">
          Change Profile Picture
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">{admin.name}</h1>
          <p className="text-gray-500 mt-1">
            {admin.jobTitle || "No job title"}
          </p>
        </div>

        <p className="text-sm text-gray-400">Role: {admin.role}</p>
      </CardBody>
    </Card>
  );
};

export default AdminProfileCard;
