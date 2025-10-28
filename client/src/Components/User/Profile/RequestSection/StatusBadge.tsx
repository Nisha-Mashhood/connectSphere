import { Chip } from "@nextui-org/react";

interface StatusBadgeProps {
  status: "Accepted" | "Rejected" | "Pending";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "Accepted":
      return <Chip color="success" variant="flat">Accepted</Chip>;
    case "Rejected":
      return <Chip color="danger" variant="flat">Rejected</Chip>;
    case "Pending":
    default:
      return <Chip color="warning" variant="flat">Pending</Chip>;
  }
};