import { useState, useEffect, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import { getAllGroupRequests, groupDetails } from "../../Service/Group.Service";
import { useCancellableFetch } from "../../Hooks/useCancellableFetch";
import { Group, GroupRequests } from "../../redux/types";

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 600;

export const useGroupCollab = () => {
  const [activeTab, setActiveTab] = useState<"groups" | "requests">("groups");
  const [groups, setGroups] = useState<Group[]>([]);
  const [requests, setRequests] = useState<GroupRequests[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedQuery(value);
      }, DEBOUNCE_MS),
    []
  );

  useEffect(() => () => debouncedUpdate.cancel(), [debouncedUpdate]);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchInput(query);
      debouncedUpdate(query);
    },
    [debouncedUpdate]
  );

  const fetchGroups = useCancellableFetch(async (signal) => {
    const params = { search: debouncedQuery, page, limit: PAGE_SIZE };
    const res = await groupDetails(params, signal);
    return res;
  }, [debouncedQuery, page]);

  const fetchRequests = useCancellableFetch(async (signal) => {
    const params = { search: debouncedQuery, page, limit: PAGE_SIZE };
    const res = await getAllGroupRequests(params, signal);
    return res;
  }, [debouncedQuery, page]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (activeTab === "groups") {
          const data = await fetchGroups();
          if (data) {
            setGroups(data.groups || []);
            setTotal(data.total || 0);
          }
        } else {
          const data = await fetchRequests();
          if (data) {
            setRequests(data.requests || []);
            setTotal(data.total || 0);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, fetchGroups, fetchRequests]);

  useEffect(() => setPage(1), [debouncedQuery]);

  return {
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
  };
};