import { Tabs, Tab, Tooltip, Button } from "@nextui-org/react";
import { FaCheck, FaStar, FaTimes } from "react-icons/fa";
import { BsStar } from "react-icons/bs";
import DataTable from "../ReusableComponents/DataTable";
import SearchBar from "../ReusableComponents/SearchBar";
import { useReviewManagement } from "../../Hooks/Admin/useReviewManagement";
import { Review } from "../../Interface/IReview";

const ReviewManagement = () => {
  const {
    reviews,
    loading,
    page,
    limit,
    total,
    searchQuery,
    setSearchQuery,
    setPage,
    handleApprove,
    handleCancelApproval,
    handleSelect,
    handleDeselect,
  } = useReviewManagement();

  const columns = [
    {
      key: "user",
      label: "User",
      render: (r: Review) => (
        <span>{r.user.name} ({r.user.email})</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (r: Review) => (
        <div className="flex">
          {[...Array(r.rating)].map((_, i) => (
            <FaStar key={i} className="text-yellow-400" />
          ))}
        </div>
      ),
    },
    { key: "comment", label: "Comment" },
    {
      key: "isApproved",
      label: "Approved",
      render: (r: Review) => (r.isApproved ? "Yes" : "No"),
    },
    {
      key: "isSelect",
      label: "Selected",
      render: (r: Review) => (r.isSelect ? "Yes" : "No"),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (r: Review) =>
        new Date(r.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r: Review) => (
        <div className="flex space-x-2">

          {!r.isApproved && (
            <Tooltip content="Approve">
              <Button isIconOnly color="success" onPress={() => handleApprove(r.id)}>
                <FaCheck />
              </Button>
            </Tooltip>
          )}

          {r.isApproved && (
            <Tooltip content="Cancel Approval">
              <Button isIconOnly color="danger" onPress={() => handleCancelApproval(r.id)}>
                <FaTimes />
              </Button>
            </Tooltip>
          )}

          {r.isApproved && !r.isSelect && (
            <Tooltip content="Select for Display">
              <Button isIconOnly color="primary" onPress={() => handleSelect(r.id)}>
                <FaStar />
              </Button>
            </Tooltip>
          )}

          {r.isSelect && (
            <Tooltip content="Deselect">
              <Button isIconOnly color="warning" onPress={() => handleDeselect(r.id)}>
                <BsStar />
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Review Management</h2>

      <Tabs aria-label="Review Tabs" color="primary" variant="bordered">
        <Tab key="app-reviews" title="App Reviews">

          <div className="mt-4">

            <div className="mb-4 w-80">
              <SearchBar
                activeTab="Reviews"
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearchChange={(value) => {
                  setPage(1);
                  setSearchQuery(value);
                }}
              />
            </div>

            <DataTable<Review>
              data={reviews}
              columns={columns}
              loading={loading}
              total={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
              emptyMessage="No reviews found"
            />

          </div>

        </Tab>

        <Tab key="user-reviews" title="User Reviews">
          <p className="mt-4">User Reviews management.</p>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ReviewManagement;
