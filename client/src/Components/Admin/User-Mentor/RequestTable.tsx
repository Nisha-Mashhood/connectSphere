import { RequestData } from "../../../redux/types";
import { User, Chip } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../ReusableComponents/DataTable";

interface RequestTableProps {
  data: RequestData[];
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function RequestTable({
  data,
  page,
  total,
  limit,
  onPageChange,
  loading,
  searchValue,
  onSearchChange,
}: RequestTableProps) {
  const navigate = useNavigate();

  const columns = [
    {
      key: "mentee",
      label: "MENTEE",
      render: (item: RequestData) => (
        <User
          avatarProps={{ src: item.user?.profilePic || "", radius: "full" }}
          name={item.user?.name}
          description={item.user?.email}
        />
      ),
    },
    {
      key: "mentor",
      label: "REQUESTED MENTOR",
      render: (item: RequestData) => (
        <User
          avatarProps={{ src: item.mentor?.user?.profilePic || "", radius: "full" }}
          name={item.mentor?.user?.name}
          description={item.mentor?.user?.email}
        />
      ),
    },
    { key: "specialization", label: "SPECIALIZATION", render: (item: RequestData) => item.mentor?.specialization },
    {
      key: "slot",
      label: "REQUESTED SLOT",
      render: (item: RequestData) => (
        <div>
          <div>{item.selectedSlot?.day}</div>
          <div className="text-sm text-gray-500">{item.selectedSlot?.timeSlots}</div>
        </div>
      ),
    },
    { key: "price", label: "PRICE", render: (item: RequestData) => `$${item.price}` },
    {
      key: "status",
      label: "STATUS",
      render: (item: RequestData) => {
        if (item.isAccepted === "Rejected") return <Chip color="danger" variant="flat" size="sm">Deactive</Chip>;
        if (item.isAccepted  || item.isAccepted === "Accepted" )
          return <Chip color="success" variant="flat" size="sm">Active</Chip>;
        return <Chip color="warning" variant="flat" size="sm">Pending</Chip>;
      },
    },
    { key: "created", label: "CREATED", render: (item: RequestData) => <span className="text-sm text-gray-500">{formatDate(item.createdAt)}</span> },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      total={total}
      page={page}
      limit={limit}
      onPageChange={onPageChange}
      loading={loading}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search mentee, mentor, or slot..."
      onRowClick={(item) => navigate(`/admin/request/${item.id}`)}
    />
  );
}