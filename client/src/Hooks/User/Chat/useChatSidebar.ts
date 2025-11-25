import { useMemo } from "react";

export const useChatSidebar = ({
  contacts,
  callLogs,
  searchQuery,
  selectedType
}) => {

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === "all" || c.type === selectedType;
      return matchSearch && matchType;
    });
  }, [contacts, searchQuery, selectedType]);

  const filteredCallLogs = useMemo(() => {
    return callLogs.filter((log) =>
      log.callerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [callLogs, searchQuery]);

  const counts = {
    all: contacts.length,
    userUser: contacts.filter((c) => c.type === "user-user").length,
    userMentor: contacts.filter((c) => c.type === "user-mentor").length,
    groups: contacts.filter((c) => c.type === "group").length,
    calls: filteredCallLogs.length
  };

  return {
    filteredContacts,
    filteredCallLogs,
    counts
  };
};
