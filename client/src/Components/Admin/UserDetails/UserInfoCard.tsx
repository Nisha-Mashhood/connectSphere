import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { FaEnvelope, FaUserTie } from "react-icons/fa";
import { User } from "../../../redux/types";

interface Props {
  user: User;
}

const UserInfoCard: React.FC<Props> = ({ user }) => {
  const formatDate = (date: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Not provided";

  return (
    <Card className="lg:col-span-2 shadow-lg border border-gray-200">
      <CardBody className="p-8 space-y-8">
        {/* Personal Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <FaEnvelope className="text-primary-600" />
            Personal Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-800 break-all">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Phone</p>
              <p className="text-gray-800">{user.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Date of Birth</p>
              <p className="text-gray-800">{formatDate(user.dateOfBirth)}</p>
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <FaUserTie className="text-emerald-600" />
            Professional Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Job Title</p>
              <p className="text-gray-800">{user.jobTitle || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Industry</p>
              <p className="text-gray-800">{user.industry || "Not specified"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-600">Reason for Joining</p>
              <p className="text-gray-800 italic">
                {user.reasonForJoining || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default React.memo(UserInfoCard);