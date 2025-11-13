import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@nextui-org/react";
import DataTable from "../../ReusableComponents/DataTable";
import { GroupRequests } from "../../../redux/types";

interface Props {
  requests: GroupRequests[];
  total: number;
  page: number;
  onPageChange: (p: number) => void;
  loading: boolean;
  pageSize?: number;
}

const RequestList: React.FC<Props> = ({
  requests,
  total,
  page,
  onPageChange,
  loading,
  pageSize = 10,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    if (status === "Accepted") return "bg-green-100 text-green-800";
    if (status === "Rejected") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const columns = useMemo(
    () => [
      {
        key: "user",
        label: "User",
        render: (req: GroupRequests) => (
          <div className="flex items-center">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={req.user.profilePic}
              alt={req.user.name}
            />
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{req.user.name}</div>
              <div className="text-sm text-gray-500">{req.user.email}</div>
            </div>
          </div>
        ),
      },
      {
        key: "group",
        label: "Group",
        render: (req: GroupRequests) => req.group.name,
      },
      {
        key: "status",
        label: "Status",
        render: (req: GroupRequests) => (
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
              req.status
            )}`}
          >
            {req.status}
          </span>
        ),
      },
      {
        key: "paymentStatus",
        label: "Payment",
        render: (req: GroupRequests) => (
          <span className="text-sm text-gray-700">{req.paymentStatus}</span>
        ),
      },
      {
        key: "createdAt",
        label: "Date",
        render: (req: GroupRequests) =>
          new Date(req.createdAt).toLocaleDateString(),
      },
      {
        key: "action",
        label: "Action",
        render: (req: GroupRequests) => (
          <Button
            size="sm"
            color="primary"
            variant="light"
            onPress={() => navigate(`/admin/group-request/${req.id}`)}
          >
            Details
          </Button>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <DataTable<GroupRequests>
        data={requests}
        columns={columns}
        total={total}
        page={page}
        limit={pageSize}
        onPageChange={onPageChange}
        loading={loading}
        emptyMessage="No requests found."
      />
    </div>
  );
};

export default React.memo(RequestList);
