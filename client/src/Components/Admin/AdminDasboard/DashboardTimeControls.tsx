import { Button, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from "@nextui-org/react";
import { FaCalendarAlt, FaChevronDown, FaChartLine } from "react-icons/fa";

interface Props {
  timeRange: string;
  setTimeRange: (v: string) => void;
  timeFormat: string;
  setTimeFormat: (v: string) => void;
}

export const DashboardTimeControls = ({
  timeRange,
  setTimeRange,
  timeFormat,
  setTimeFormat
}: Props) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat" endContent={<FaChevronDown />} startContent={<FaCalendarAlt />}>
            {timeRange === "7"
              ? "Last 7 days"
              : timeRange === "30"
              ? "Last 30 days"
              : timeRange === "90"
              ? "Last 90 days"
              : "Last 12 months"}
          </Button>
        </DropdownTrigger>

        <DropdownMenu onAction={(key) => setTimeRange(key.toString())}>
          <DropdownItem key="7">Last 7 days</DropdownItem>
          <DropdownItem key="30">Last 30 days</DropdownItem>
          <DropdownItem key="90">Last 90 days</DropdownItem>
          <DropdownItem key="365">Last 12 months</DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat" endContent={<FaChevronDown />} startContent={<FaChartLine />}>
            {timeFormat === "daily"
              ? "Daily"
              : timeFormat === "weekly"
              ? "Weekly"
              : "Monthly"}
          </Button>
        </DropdownTrigger>

        <DropdownMenu onAction={(key) => setTimeFormat(key.toString())}>
          <DropdownItem key="daily">Daily</DropdownItem>
          <DropdownItem key="weekly">Weekly</DropdownItem>
          <DropdownItem key="monthly">Monthly</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};