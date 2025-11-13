import { useEffect, useState, useCallback } from "react";
import {
  get_all_reviews,
  approve_review,
  select_review,
  cancel_approval,
  deselect_review,
} from "../../Service/Review.Service";

import toast from "react-hot-toast";
import { Review } from "../../Interface/IReview";

export function useReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await get_all_reviews({
        page,
        limit,
        search: searchQuery,
      });

      setReviews(response?.reviews || []);
      setTotal(response?.total || 0);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  
  const updateUI = (id: string, update: Partial<Review>) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...update } : r))
    );
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await approve_review(id);
      if (res?.isApproved) {
        updateUI(id, { isApproved: true });
        toast.success("Review approved");
      }
    } catch {
      toast.error("Approve failed");
    }
  };

  const handleCancelApproval = async (id: string) => {
    try {
      const res = await cancel_approval(id);
      if (!res?.isApproved) {
        updateUI(id, { isApproved: false, isSelect: false });
        toast.success("Approval canceled");
      }
    } catch {
      toast.error("Cancel failed");
    }
  };

  const handleSelect = async (id: string) => {
    try {
      const res = await select_review(id);
      if (res?.isSelect) {
        updateUI(id, { isSelect: true });
        toast.success("Review selected");
      }
    } catch {
      toast.error("Select failed");
    }
  };

  const handleDeselect = async (id: string) => {
    try {
      const res = await deselect_review(id);
      if (!res?.isSelect) {
        updateUI(id, { isSelect: false });
        toast.success("Review deselected");
      }
    } catch {
      toast.error("Deselect failed");
    }
  };

  return {
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
  };
}
