import { Select, SelectItem, Chip } from "@nextui-org/react";

export default function TaskFooter({ task, onStatusChange, onPriorityChange }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-200">
      {/* Status */}
      <div className="flex-1 min-w-[150px] min-h-[30px]">
        <Select
          label="Update Status"
          selectedKeys={[task.status]}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          size="md"
          variant="bordered"
          className="w-full"
          classNames={{
            label: "whitespace-nowrap font-semibold",
            trigger: "min-h-[20px]",
          }}
        >
          <SelectItem key="pending">
            <Chip color="warning">⏳ Pending</Chip>
          </SelectItem>
          <SelectItem key="in-progress">
            <Chip color="primary">🚀 In Progress</Chip>
          </SelectItem>
          <SelectItem key="completed">
            <Chip color="success">✓ Completed</Chip>
          </SelectItem>
          <SelectItem key="not-completed">
            <Chip color="danger">✗ Not Completed</Chip>
          </SelectItem>
        </Select>
      </div>

      {/* Priority */}
      <div className="flex-1 min-w-[150px] min-h-[30px]">
        <Select
          label="Update Priority"
          selectedKeys={[task.priority]}
          onChange={(e) => onPriorityChange(task.id, e.target.value)}
          size="md"
          variant="bordered"
          className="w-full"
          classNames={{
            label: "whitespace-nowrap font-semibold",
            trigger: "min-h-[20px]",
          }}
        >
          <SelectItem key="low">
            <Chip color="success">Low</Chip>
          </SelectItem>
          <SelectItem key="medium">
            <Chip color="warning">Medium</Chip>
          </SelectItem>
          <SelectItem key="high">
            <Chip color="danger">High</Chip>
          </SelectItem>
        </Select>
      </div>
    </div>
  );
}
