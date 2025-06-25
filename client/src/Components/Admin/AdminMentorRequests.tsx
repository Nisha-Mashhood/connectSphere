import React, { useCallback, useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { toast } from "react-hot-toast";
import MentorDetailModal from "./MentorDetailModal";
import {
  fetchMentorRequests as fetchMentorRequestsService,
} from "../../Service/Mentor.Service";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  SelectItem,
  Button,
  Pagination,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";

interface MentorRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  isApproved: string;
  specialization: string;
  skills: Array<{ name: string }>;
  certifications: string[];
  price: number;
  bio: string;
  availableSlots:{
      day:string,
      timeSlots:string[]
    }[];
}

const AdminMentorRequests: React.FC = () => {
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<MentorRequest | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 5; // Items per page

  // Fetch mentor requests with pagination, search, and filter
  const fetchMentorRequests = useCallback(async () => {
    try {
      const data = await fetchMentorRequestsService(page, limit, search, statusFilter, "desc");
      setMentorRequests(data.mentors);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error("Failed to fetch mentor requests.");
      console.error("Error:", error);
    }
  },[page,search,statusFilter])

  useEffect(() => {
    fetchMentorRequests();
  }, [fetchMentorRequests]);

  const handleViewDetails = (mentor: MentorRequest) => {
    setSelectedMentor(mentor);
  };

  const handleCloseModal = () => {
    setSelectedMentor(null);
    fetchMentorRequests(); // Refresh list after modal close
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page on filter
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <Card className="shadow-lg rounded-xl h-full">
        <CardHeader className="bg-primary-50 p-4 rounded-t-xl">
          <h1 className="text-2xl font-bold text-primary">Mentor Requests</h1>
        </CardHeader>
        <CardBody className="p-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearchChange}
              className="max-w-sm"
              startContent={<FaEye className="text-gray-400" />}
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="max-w-xs"
            >
              <SelectItem key="" value="">All</SelectItem>
              <SelectItem key="Processing" value="Processing">Processing</SelectItem>
              <SelectItem key="Completed" value="Completed">Approved</SelectItem>
              <SelectItem key="Rejected" value="Rejected">Rejected</SelectItem>
            </Select>
          </div>

          {/* Table */}
          <Table aria-label="Mentor Requests Table" className="mb-6">
            <TableHeader>
              <TableColumn>Full Name</TableColumn>
              <TableColumn>Email</TableColumn>
              <TableColumn>Status</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {mentorRequests.map((mentor) => (
                <TableRow key={mentor._id} className="hover:bg-gray-50">
                  <TableCell>{mentor.userId ? mentor.userId.name : "Unknown User"}</TableCell>
                  <TableCell>{mentor.userId ? mentor.userId.email : "N/A"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      mentor.isApproved === "Completed" ? "bg-green-100 text-green-800" :
                      mentor.isApproved === "Rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {mentor.isApproved}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      isIconOnly
                      color="primary"
                      variant="light"
                      onPress={() => handleViewDetails(mentor)}
                      title="View Mentor Details"
                    >
                      <FaEye className="w-5 h-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-center">
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
              color="primary"
              showControls
            />
          </div>
        </CardBody>
      </Card>

      {selectedMentor && (
        <MentorDetailModal mentor={selectedMentor} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default AdminMentorRequests;