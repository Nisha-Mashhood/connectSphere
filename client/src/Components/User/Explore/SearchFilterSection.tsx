import { Button } from '@nextui-org/react';
import { FaFilter } from 'react-icons/fa';
import SearchBar from '../../ReusableComponents/SearchBar';
import FilterSection from '../../ReusableComponents/FilterSection';
import { FilterType } from '../../../Hooks/User/useExploreMentors';


interface SearchFilterSectionProps {
  activeTab: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchChange: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterTypes: FilterType[];
}

const SearchFilterSection = ({
  activeTab,
  searchQuery,
  setSearchQuery,
  handleSearchChange,
  showFilters,
  setShowFilters,
  filterTypes,
}: SearchFilterSectionProps) => (
  <div className="mb-8 space-y-4">
    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
      <div className="flex-1">
        <SearchBar
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchChange={handleSearchChange}
        />
      </div>
      {activeTab === 'mentors' && (
        <Button
          color="primary"
          variant={showFilters ? 'solid' : 'bordered'}
          onPress={() => setShowFilters(!showFilters)}
          startContent={<FaFilter />}
          size="lg"
        >
          Filters
        </Button>
      )}
    </div>
    {activeTab === 'mentors' && (
      <FilterSection showFilters={showFilters} filterTypes={filterTypes} />
    )}
  </div>
);

export default SearchFilterSection;