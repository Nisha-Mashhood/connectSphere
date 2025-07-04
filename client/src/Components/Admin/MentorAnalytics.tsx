import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { getMentorAnalytics } from "../../Service/Mentor.Service";

interface MentorAnalytics {
  mentorId: string;
  name: string;
  email: string;
  specialization: string | undefined;
  approvalStatus: string | undefined;
  totalCollaborations: number;
  totalEarnings: number;
  platformFees: number;
  avgCollabPrice: number;
}

const MentorAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<MentorAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<
    "totalEarnings" | "platformFees" | "totalCollaborations" | "avgCollabPrice"
  >("totalEarnings");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMentorAnalytics(page, 10, sortBy, sortOrder);
      setAnalytics(response.mentors);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error("Failed to fetch mentor analytics");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    fetchAnalytics();
  }, [page, sortBy, sortOrder, fetchAnalytics]);

  const handleSortChange = (
    field:
      | "totalEarnings"
      | "platformFees"
      | "totalCollaborations"
      | "avgCollabPrice"
  ) => {
    setSortBy(field);
    setSortOrder(sortBy === field && sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Card className="shadow-md">
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mentor Analytics</h1>
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    | "totalEarnings"
                    | "platformFees"
                    | "totalCollaborations"
                    | "avgCollabPrice"
                )
              }
              className="px-4 py-2 border rounded-md"
            >
              <option value="totalEarnings">Total Earnings</option>
              <option value="platformFees">Platform Fees</option>
              <option value="totalCollaborations">Total Sessions</option>
              <option value="avgCollabPrice">Avg. Session Price</option>
            </select>
            <Button onPress={() => handleSortChange(sortBy)} color="primary">
              Sort {sortOrder === "desc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p>Loading...</p>
          ) : analytics.length === 0 ? (
            <p>No mentors found.</p>
          ) : (
            <>
              <Table aria-label="Mentor Analytics Table">
                <TableHeader>
                  <TableColumn>Name</TableColumn>
                  <TableColumn>Email</TableColumn>
                  <TableColumn>Specialization</TableColumn>
                  <TableColumn>Status</TableColumn>
                  <TableColumn>Sessions</TableColumn>
                  <TableColumn>Earnings (₹)</TableColumn>
                  <TableColumn>Platform Fees (₹)</TableColumn>
                  <TableColumn>Avg. Price (₹)</TableColumn>
                  <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                  {analytics.map((mentor) => (
                    <TableRow key={mentor.mentorId}>
                      <TableCell>{mentor.name}</TableCell>
                      <TableCell>{mentor.email}</TableCell>
                      <TableCell>{mentor.specialization || "N/A"}</TableCell>
                      <TableCell>{mentor.approvalStatus || "N/A"}</TableCell>
                      <TableCell>{mentor.totalCollaborations}</TableCell>
                      <TableCell>{mentor.totalEarnings.toFixed(2)}</TableCell>
                      <TableCell>{mentor.platformFees.toFixed(2)}</TableCell>
                      <TableCell>{mentor.avgCollabPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          color="primary"
                          onPress={() => navigate(`/admin/userMentorManagemnt`)}
                        >
                          View Collaborations
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between mt-4">
                <Button
                  onPress={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  color="default"
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  onPress={() => {
                    if (page < totalPages) setPage((p) => p + 1);
                  }}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default MentorAnalytics;
