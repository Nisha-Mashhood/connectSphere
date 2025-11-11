import { CollabData } from "../../../redux/types";
import { User, Chip } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../ReusableComponents/DataTable";

interface CollaborationTableProps {
  data: CollabData[];
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

export default function CollaborationTable({
  data,
  page,
  total,
  limit,
  onPageChange,
  loading,
  searchValue,
  onSearchChange,
}: CollaborationTableProps) {
  const navigate = useNavigate();

  const columns = [
    {
      key: "mentor",
      label: "MENTOR",
      render: (item: CollabData) => (
        <User
          avatarProps={{ src: item.mentor?.user?.profilePic || "", radius: "full" }}
          name={item.mentor?.user?.name}
          description={item.mentor?.user?.email}
        />
      ),
    },
    {
      key: "mentee",
      label: "MENTEE",
      render: (item: CollabData) => (
        <User
          avatarProps={{ src: item.user?.profilePic || "", radius: "full" }}
          name={item.user?.name}
          description={item.user?.email}
        />
      ),
    },
    { key: "specialization", label: "SPECIALIZATION", render: (item: CollabData) => item.mentor?.specialization },
    { key: "price", label: "PRICE", render: (item: CollabData) => `$${item.price}` },
    {
      key: "period",
      label: "PERIOD",
      render: (item: CollabData) => (
        <div>
          <div>{formatDate(item.startDate)}</div>
          <div className="text-sm text-gray-500">to {formatDate(item.endDate)}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      render: (item: CollabData) => {
        if (item.isCancelled) return <Chip color="danger" variant="flat" size="sm">Deactive</Chip>;
        const isCompleted = item.endDate && new Date(item.endDate) < new Date();
        if (isCompleted) return <Chip color="default" variant="flat" size="sm">Completed</Chip>;
        return item.payment ? (
          <Chip color="success" variant="flat" size="sm">Active</Chip>
        ) : (
          <Chip color="warning" variant="flat" size="sm">Pending</Chip>
        );
      },
    },
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
      searchPlaceholder="Search mentor, mentee, or specialization..."
      onRowClick={(item) => navigate(`/admin/collaboration/${item.id}`)}
    />
  );
}