import React from "react";
import SearchBar from "../../Components/ReusableComponents/SearchBar";
import { useGroupCollab } from "../../Hooks/Admin/useGroupCollab";
import GroupList from "../../Components/Admin/GroupCollab/GroupList";
import RequestList from "../../Components/Admin/GroupCollab/RequestList";

const GroupCollab: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    groups,
    requests,
    total,
    page,
    setPage,
    loading,
    searchInput,
    setSearchInput,
    handleSearchChange,
  } = useGroupCollab();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Group Collaborations</h2>
        <div className="flex space-x-2">
          {[
            { key: "groups", label: `Groups (${groups.length})` },
            { key: "requests", label: `Requests (${requests.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "groups" | "requests")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          activeTab={activeTab}
          searchQuery={searchInput}
          setSearchQuery={setSearchInput}
          onSearchChange={handleSearchChange}
        />
      </div>

      {activeTab === "groups" ? (
        <GroupList
          groups={groups}
          total={total}
          page={page}
          onPageChange={setPage}
          loading={loading}
        />
      ) : (
        <RequestList
          requests={requests}
          total={total}
          page={page}
          onPageChange={setPage}
          loading={loading}
        />
      )}
    </div>
  );
};

export default GroupCollab;
