import { Card, Select, SelectItem } from "@nextui-org/react";
import { FilterType } from "../../Hooks/User/useExploreMentors";

interface FilterSectionProps {
  showFilters: boolean;
  filterTypes: FilterType[];
}

const FilterSection = ({ showFilters, filterTypes }: FilterSectionProps) => {
  return (
    <div
      className={`transition-all duration-300 ${
        showFilters
          ? "max-h-96 opacity-100"
          : "max-h-0 opacity-0 overflow-hidden"
      }`}
    >
      <Card className="p-4 mb-4">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${
            filterTypes.length > 4 ? 4 : filterTypes.length
          } gap-4`}
        >
          {filterTypes.map((filter) => (
            <Select
              key={filter.name}
              label={filter.label}
              placeholder={filter.placeholder}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              size="sm"
              variant="bordered"
            >
              {filter.options.map((option) => (
                <SelectItem key={option.key} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FilterSection;