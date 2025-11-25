import { Input, Button } from "@nextui-org/react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SidebarHeader = ({
  selectedType,
  searchQuery,
  setSearchQuery,
  isOverlay,
  onClose
}) => (
  <div className="flex items-center justify-between p-3 bg-indigo-500 text-white">
    <Input
      placeholder={selectedType === "calls" ? "Search call history..." : "Search conversations..."}
      startContent={<FaSearch />}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      size="sm"
    />

    {isOverlay && (
      <Button isIconOnly variant="light" size="sm" onPress={onClose}>
        <FaTimes />
      </Button>
    )}
  </div>
);

export default SidebarHeader;
