import { Mentor } from "../../redux/types";
import { Button, Select, SelectItem, Chip } from "@nextui-org/react";
import { FaEye } from "react-icons/fa";
import MentorDetailModal from "../../Components/Admin/MentorDetails/MentorDetailModal";
import { toast } from "react-hot-toast";
import { useCallback, useEffect, useState } from "react";
import DataTable from "../../Components/ReusableComponents/DataTable";
import { fetchMentorRequestsService } from "../../Service/Mentor.Service";
import SearchBar from "../../Components/ReusableComponents/SearchBar";
import { SlidersHorizontal } from "lucide-react";

const LIMIT = 10;

const AdminMentorRequests: React.FC = () => {
  const [mentorRequests, setMentorRequests] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchMentorRequests = useCallback(async () => {
    try {
      const response = await fetchMentorRequestsService(page, LIMIT, search, statusFilter, "desc");
      setMentorRequests(response.mentors);
      setTotal(response.totalPages * LIMIT);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch mentor requests.");
    }
  },[page, search, statusFilter]);

  useEffect(() => {
    fetchMentorRequests();
  }, [fetchMentorRequests]);

  const handleMentorUpdate = (updatedMentor: Mentor) => {
    setMentorRequests((prev) =>
      prev.map((m) => (m.id === updatedMentor.id ? updatedMentor : m))
    );
  };

  const columns = [
    {
      key: "name",
      label: "Full Name",
      render: (m: Mentor) => m.user?.name || "Unknown User",
    },
    {
      key: "email",
      label: "Email",
      render: (m: Mentor) => m.user?.email || "N/A",
    },
    {
      key: "status",
      label: "Status",
      render: (m: Mentor) => (
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            m.isApproved === "Completed"
              ? "bg-green-100 text-green-800"
              : m.isApproved === "Rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {m.isApproved}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (m: Mentor) => (
        <Button
          isIconOnly
          color="primary"
          variant="light"
          onPress={() => setSelectedMentor(m)}
        >
          <FaEye className="w-5 h-5" />
        </Button>
      ),
    },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Processing": return "Processing";
      case "Completed": return "Approved";
      case "Rejected": return "Rejected";
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">Mentor Requests</h1>

        {/*Search & Filter Bar */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search Bar */}
            <div className="flex-1">
              <SearchBar
                activeTab="Mentors"
                searchQuery={search}
                setSearchQuery={setSearch}
                onSearchChange={setSearch}
              />
            </div>

            {/* Filter Section */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Filter:</span>
              </div>
              <Select
                placeholder="Status"
                selectedKeys={statusFilter ? [statusFilter] : []}
                onSelectionChange={(keys) => {
                  setStatusFilter(Array.from(keys)[0] as string || "");
                  setPage(1);
                }}
                className="w-40"
                size="md"
                classNames={{
                  trigger: "bg-white border-gray-300 hover:bg-gray-50 transition-colors shadow-sm",
                }}
              >
                <SelectItem key="">All Status</SelectItem>
                <SelectItem key="Processing">Processing</SelectItem>
                <SelectItem key="Completed">Approved</SelectItem>
                <SelectItem key="Rejected">Rejected</SelectItem>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(search || statusFilter) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-300">
              <span className="text-xs text-gray-500 font-medium">Active filters:</span>
              {search && (
                <Chip
                  size="sm"
                  variant="flat"
                  onClose={() => setSearch("")}
                  classNames={{
                    base: "bg-blue-50 text-blue-700",
                    closeButton: "text-blue-700",
                  }}
                >
                  Search: "{search}"
                </Chip>
              )}
              {statusFilter && (
                <Chip
                  size="sm"
                  variant="flat"
                  onClose={() => {
                    setStatusFilter("");
                    setPage(1);
                  }}
                  classNames={{
                    base: "bg-purple-50 text-purple-700",
                    closeButton: "text-purple-700",
                  }}
                >
                  Status: {getStatusLabel(statusFilter)}
                </Chip>
              )}
            </div>
          )}
        </div>

        <DataTable
          data={mentorRequests}
          columns={columns}
          total={total}
          page={page}
          limit={LIMIT}
          onPageChange={setPage}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or email..."
        />
      </div>

      {selectedMentor && (
        <MentorDetailModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onMentorUpdate={handleMentorUpdate}
        />
      )}
    </div>
  );
};

export default AdminMentorRequests;