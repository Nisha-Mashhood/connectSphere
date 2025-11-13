import { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  CardHeader,
  Spinner,
} from "@nextui-org/react";
import CollaborationTable from "../../Components/Admin/User-Mentor/CollaborationTable";
import RequestTable from "../../Components/Admin/User-Mentor/RequestTable";
import {
  UserToMentorCollab,
  UserToMentorRequset,
} from "../../Service/collaboration.Service";
import { CollabData, RequestData } from "../../redux/types";
import { useCancellableFetch } from "../../Hooks/useCancellableFetch";
import SearchBar from "../../Components/ReusableComponents/SearchBar";

const ITEMS_PER_PAGE = 10;
type TabKey = "collaborations" | "requests";

const UserMentorCollab = () => {
  const [activeTab, setActiveTab] = useState<"collaborations" | "requests">("collaborations");
  const [searchTerm, setSearchTerm] = useState("");
  const [collabPage, setCollabPage] = useState(1);
  const [requestPage, setRequestPage] = useState(1);

  const [collabs, setCollabs] = useState<CollabData[]>([]);
  const [collabTotal, setCollabTotal] = useState(0);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [requestTotal, setRequestTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCollabPage(1);
    setRequestPage(1);
  }, [searchTerm]);

  const fetchCollabs = useCancellableFetch(
    async (signal) => {
      const res = await UserToMentorCollab(collabPage, ITEMS_PER_PAGE, searchTerm, signal);
      return { list: res.collabs || [], total: (res.pages || 1) * ITEMS_PER_PAGE };
    },
    [collabPage, searchTerm]
  );

  const fetchRequests = useCancellableFetch(
    async (signal) => {
      const res = await UserToMentorRequset(requestPage, ITEMS_PER_PAGE, searchTerm, signal);
      return { list: res.requests || [], total: (res.pages || 1) * ITEMS_PER_PAGE };
    },
    [requestPage, searchTerm]
  );

  useEffect(() => {
    setIsLoading(true);

    const load = async () => {
      if (activeTab === "collaborations") {
        const data = await fetchCollabs();
        if (data) {
          setCollabs(data.list);
          setCollabTotal(data.total);
        }
      } else {
        const data = await fetchRequests();
        if (data) {
          setRequests(data.list);
          setRequestTotal(data.total);
        }
      }
      setIsLoading(false);
    };

    load();
  }, [activeTab, fetchCollabs, fetchRequests]);

  return (
    <Card className="p-6">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-800">
          User‑Mentor Relationship Management
        </h2>
      </CardHeader>

      <CardBody className="space-y-6">

      <div className="mb-4">
        <SearchBar
          activeTab={`${activeTab === "collaborations" ? "collaborations" : "requests"} by name, email, or specialization...`}
          searchQuery={searchTerm}
          setSearchQuery={setSearchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>


        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as TabKey)}
          color="primary"
        >
          <Tab
            key="collaborations"
            title={
              <div className="flex items-center gap-2">
                Active Collaborations
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  {collabs.length}
                </span>
              </div>
            }
          />
          <Tab
            key="requests"
            title={
              <div className="flex items-center gap-2">
                Mentorship Requests
                <span className="text-xs bg-warning-100 text-warning-700 px-2 py-0.5 rounded-full">
                  {requests.length}
                </span>
              </div>
            }
          />
        </Tabs>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {activeTab === "collaborations" && (
              <CollaborationTable
                data={collabs}
                page={collabPage}
                total={collabTotal}
                limit={ITEMS_PER_PAGE}
                onPageChange={setCollabPage}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}

            {activeTab === "requests" && (
              <RequestTable
                data={requests}
                page={requestPage}
                total={requestTotal}
                limit={ITEMS_PER_PAGE}
                onPageChange={setRequestPage}
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default UserMentorCollab;