import { Input } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  activeTab: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchChange?: (query: string) => void;
}

const SearchBar = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  onSearchChange,
}: SearchBarProps) => {
  return (
    <Input
      type="text"
      placeholder={`Search ${activeTab}...`}
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        if (onSearchChange) onSearchChange(e.target.value);
      }}
      size="lg"
      variant="bordered"
      startContent={<FaSearch className="text-default-400" />}
      classNames={{
        input: "text-base",
        inputWrapper: "shadow-sm hover:shadow-md transition-shadow",
      }}
    />
  );
};

export default SearchBar;