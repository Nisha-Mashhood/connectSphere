import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserConnection } from "../../redux/types";
import SearchBar from "../../Components/ReusableComponents/SearchBar";
import { fetchAllUserConnections } from "../../Service/User-User.Service";
import ConnectionCard from "../../Components/Admin/User-User/ConnectionCard";
import Pagination from "../../Components/ReusableComponents/Pagination";

const PAGE_SIZE = 10;

const UserUserCollab = () => {
  const navigate = useNavigate();

  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadConnections = useCallback(async (signal?: AbortSignal) => {
  try {
    setIsLoading(true);
    const res = await fetchAllUserConnections(page, PAGE_SIZE, searchQuery, signal);
    setConnections(res.data);
    setTotal(res.pagination.total);
  } catch (error) {
    if (error.name !== "AbortError") console.error("Fetch error:", error);
  } finally {
    setIsLoading(false);
  }
}, [page, searchQuery]);

  useEffect(() => {
  const controller = new AbortController();
  loadConnections(controller.signal);
  return () => controller.abort();
}, [loadConnections]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">User Collaborations</h2>

        <div className="w-full sm:w-80">
          <SearchBar
            activeTab="connections"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        {total} connection{total !== 1 ? "s" : ""} found
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : connections.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No connections found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((conn) => (
              <ConnectionCard
                key={conn.id}
                conn={conn}
                onClick={(id) => navigate(`/admin/user-collab/${id}`)}
              />
            ))}
          </div>

          <Pagination
            page={page}
            limit={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default UserUserCollab;
