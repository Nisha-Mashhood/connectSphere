import React from "react";
import { Button, Tooltip } from "@nextui-org/react";
import { Check, X, IndianRupee } from "lucide-react";
import { GroupRequests } from "../../../../redux/types";

interface GroupRequestDetailsProps {
  request: GroupRequests;
  onUpdate: (status: string) => void;
}

const GroupRequestDetails: React.FC<GroupRequestDetailsProps> = ({ request, onUpdate }) => (
  <div className="border rounded-lg p-6 bg-gray-50 shadow-sm">
    <h2 className="text-xl font-semibold text-gray-800 mb-6">Membership Request</h2>

    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium text-gray-800">{request.user.name}</p>
        <p className="text-gray-500 text-sm">{request.user.email}</p>
        <p className="text-gray-600 text-sm mt-2 flex items-center">
          <IndianRupee className="w-4 h-4 mr-1 text-gray-500" />
          <span>
            Amount Paid:{" "}
            <span className="font-semibold text-gray-800">
              {request.paymentStatus === "Paid" ? request.amountPaid : "Not Paid"}
            </span>
          </span>
        </p>

        <p className="text-gray-500 text-sm mt-1">
          Status:{" "}
          <span
            className={`font-semibold ${
              request.status === "Accepted"
                ? "text-green-600"
                : request.status === "Rejected"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {request.status}
          </span>
        </p>
      </div>

      {request.status === "Pending" && (
        <div className="flex gap-2">
          <Tooltip content="Approve" color="success" placement="top">
            <Button
              isIconOnly
              color="success"
              size="sm"
              radius="full"
              onPress={() => onUpdate("Accepted")}
              aria-label="Approve request"
            >
              <Check className="w-4 h-4" />
            </Button>
          </Tooltip>

          <Tooltip content="Reject" color="danger" placement="top">
            <Button
              isIconOnly
              color="danger"
              size="sm"
              radius="full"
              onPress={() => onUpdate("Rejected")}
              aria-label="Reject request"
            >
              <X className="w-4 h-4" />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  </div>
);

export default GroupRequestDetails;