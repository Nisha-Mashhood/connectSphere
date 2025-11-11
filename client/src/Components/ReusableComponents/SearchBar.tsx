import { Input, InputProps } from "@nextui-org/react";
import { FaSearch } from "react-icons/fa";
import { X } from "lucide-react";
import { useCallback } from "react";

interface SearchBarProps extends Omit<InputProps, "onChange"> {
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
  ...rest
}: SearchBarProps) => {
  const handleClear = useCallback(() => {
    setSearchQuery("");
    onSearchChange?.("");
  }, [setSearchQuery, onSearchChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearchChange?.(val);
  };

  return (
    <Input
      type="text"
      placeholder={`Search ${activeTab}...`}
      value={searchQuery}
      onChange={handleChange}
      size="lg"
      variant="bordered"
      startContent={<FaSearch className="text-default-400" />}
      endContent={
        searchQuery ? (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-default-200 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-default-500" />
          </button>
        ) : null
      }
      classNames={{
        input: "text-base",
        inputWrapper: "shadow-sm hover:shadow-md transition-shadow",
      }}
      {...rest}
    />
  );
};

export default SearchBar;