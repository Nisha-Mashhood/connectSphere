import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Card, CardHeader, CardBody, Button } from "@nextui-org/react";
import SearchBar from "../../Components/ReusableComponents/SearchBar";
import DataTable from "../../Components/ReusableComponents/DataTable";

import { getMentorAnalytics } from "../../Service/Mentor.Service";

interface MentorAnalytics {
  mentorId: string;
  name: string;
  email: string;
  specialization?: string;
  totalCollaborations: number;
  totalEarnings: number;
  platformFees: number;
  avgCollabPrice: number;
  id: string;
}

const MentorAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<MentorAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<
    "totalEarnings" | "platformFees" | "totalCollaborations" | "avgCollabPrice"
  >("totalEarnings");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getMentorAnalytics(
        page,
        limit,
        sortBy,
        sortOrder,
        searchQuery
      );

      console.log(response);
      const mapped = response.mentors.map((m: MentorAnalytics) => ({
        ...m,
        id: m.mentorId,
      }));

      setAnalytics(mapped);
      setTotal(response.total);
    } catch (error) {
      toast.error("Failed to fetch mentor analytics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, searchQuery]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleSortFieldChange = (
    field:
      | "totalEarnings"
      | "platformFees"
      | "totalCollaborations"
      | "avgCollabPrice"
  ) => {
    setSortBy(field);
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  // DataTable Columns
  const columns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "specialization", label: "Specialization" },
      { key: "totalCollaborations", label: "Sessions" },
      {
        key: "totalEarnings",
        label: "Earnings (₹)",
        render: (row: MentorAnalytics) => row.totalEarnings.toFixed(2),
      },
      {
        key: "platformFees",
        label: "Platform Fees (₹)",
        render: (row: MentorAnalytics) => row.platformFees.toFixed(2),
      },
      {
        key: "avgCollabPrice",
        label: "Avg. Price (₹)",
        render: (row: MentorAnalytics) => row.avgCollabPrice.toFixed(2),
      },
      {
        key: "action",
        label: "Actions",
        render: () => (
          <Button
            size="sm"
            color="primary"
            onPress={() => navigate("/admin/userMentorManagemnt")}
          >
            View Collaborations
          </Button>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Card className="shadow-md">
        <CardHeader className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mentor Analytics</h1>

          <div className="flex items-center gap-4">
            <SearchBar
              activeTab="Mentors"
              searchQuery={searchQuery}
              setSearchQuery={(q) => {
                setPage(1);
                setSearchQuery(q);
              }}
              onSearchChange={(q) => {
                setPage(1);
                setSearchQuery(q);
              }}
              className="w-64"
            />

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

            <Button
              onPress={() => handleSortFieldChange(sortBy)}
              color="primary"
            >
              Sort {sortOrder === "desc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          <DataTable<MentorAnalytics>
            data={analytics}
            columns={columns}
            loading={loading}
            total={total}
            page={page}
            limit={limit}
            onPageChange={setPage}
            searchValue={searchQuery}
            onSearchChange={(v) => {
              setPage(1);
              setSearchQuery(v);
            }}
            emptyMessage="No mentors found"
            onRowClick={(row) => console.log("Clicked:", row)}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default MentorAnalytics;
