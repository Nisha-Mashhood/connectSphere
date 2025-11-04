import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface FetchParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface FetchResponse<T> {
  items: T[];
  total: number;
}

export function useCategoryTable<T extends { id: string }>({
  fetchFn,
  deleteFn,
  updateFn,
  createSuccess,
  updateSuccess,
  parentId,
}: {

  fetchFn:
    | ((parentId: string, params: FetchParams) => Promise<FetchResponse<T>>)
    | ((params: FetchParams) => Promise<FetchResponse<T>>);

  deleteFn: (id: string) => Promise<void | unknown>;
  updateFn: (id: string, data: FormData) => Promise<void | unknown>;
  createSuccess?: (item: T) => void;
  updateSuccess?: (item: T) => void;
  parentId?: string;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search: search || undefined, page, limit };

      const data = parentId
        ? await (fetchFn as (p: string, q: FetchParams) => Promise<FetchResponse<T>>)(
            parentId,
            params
          )
        : await (fetchFn as (q: FetchParams) => Promise<FetchResponse<T>>)(params);

      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [fetchFn, parentId, search, page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteFn(id);
      toast.success("Deleted successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
      fetchData();
    }
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    try {
      await updateFn(id, formData);
      toast.success("Updated successfully");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleCreate = (newItem: T) => {
    setItems((prev) => [...prev, newItem]);
    createSuccess?.(newItem);
    fetchData();
  };

  const handleUpdateLocal = (updated: T) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    updateSuccess?.(updated);
  };

  return {
    items,
    search,
    page,
    total,
    loading,
    limit,
    setPage,
    handleSearch,
    handleDelete,
    handleUpdate,
    handleCreate,
    handleUpdateLocal,
    refetch: fetchData,
  };
}