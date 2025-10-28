import { Tabs, Tab, Chip, Spinner } from "@nextui-org/react";
import { FaPaperPlane, FaInbox } from "react-icons/fa";
import { RequestCard } from "./RequestCard";
import { RequestData } from "../../../../redux/types";


interface RequestTabsProps {
  sentRequests: RequestData[];
  receivedRequests: RequestData[];
  isLoading: boolean;
  isMentor: boolean;
  handleProfileClick: (id: string) => void;
  handleAccept: (id: string) => void;
  handleReject: (id: string) => void;
  openPaymentModal: (request: RequestData) => void;
}

export const RequestTabs: React.FC<RequestTabsProps> = ({
  sentRequests,
  receivedRequests,
  isLoading,
  isMentor,
  handleProfileClick,
  handleAccept,
  handleReject,
  openPaymentModal,
}) => {
  return (
    <Tabs
      aria-label="Request tabs"
      color="primary"
      variant="underlined"
      classNames={{
        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
        cursor: "w-full bg-primary",
        tab: "max-w-fit px-0 h-12",
        tabContent: "group-data-[selected=true]:text-primary",
      }}
    >
      <Tab
        key="sent"
        title={
          <div className="flex items-center gap-2">
            <FaPaperPlane />
            <span>Sent Requests</span>
            {sentRequests.length > 0 && (
              <Chip size="sm" variant="flat" color="primary">
                {sentRequests.length}
              </Chip>
            )}
          </div>
        }
      >
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="sm" />
            </div>
          ) : sentRequests.length > 0 ? (
            sentRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                isSent={true}
                handleProfileClick={handleProfileClick}
                openPaymentModal={openPaymentModal}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-default-500">You haven't sent any requests yet.</p>
            </div>
          )}
        </div>
      </Tab>
      {isMentor && (
        <Tab
          key="received"
          title={
            <div className="flex items-center gap-2">
              <FaInbox />
              <span>Received Requests</span>
              {receivedRequests.length > 0 && (
                <Chip size="sm" variant="flat" color="primary">
                  {receivedRequests.length}
                </Chip>
              )}
            </div>
          }
        >
          <div className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Spinner size="sm" />
              </div>
            ) : receivedRequests.length > 0 ? (
              receivedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isSent={false}
                  handleProfileClick={handleProfileClick}
                  handleAccept={handleAccept}
                  handleReject={handleReject}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-default-500">You haven't received any requests yet.</p>
              </div>
            )}
          </div>
        </Tab>
      )}
    </Tabs>
  );
};