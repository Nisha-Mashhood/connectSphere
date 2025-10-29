import { Tabs, Tab } from "@nextui-org/react";
import { FaInfoCircle, FaClipboardList, FaUser } from "react-icons/fa";
import DetailsTab from "./DetailsTab";
import TasksTab from "./TasksTab";
import InfoTab from "./InfoTab";

const CollaborationTabs = ({
  activeTab,
  setActiveTab,
  collaboration,
  currentUser,
  setShowTimeSlotsModal,
  setShowUnavailableDatesModal,
  setShowCancelDialog,
}) => {
  const isMentorInCollab = collaboration.mentor.userId === currentUser.id;

  return (
    <Tabs
      aria-label="Collaboration Options"
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(key.toString())}
      className="mb-6"
      variant="bordered"
      color="primary"
    >
      <Tab
        key="details"
        title={
          <div className="flex items-center gap-2">
            <FaInfoCircle />
            <span>Details</span>
          </div>
        }
      >
        <DetailsTab
          currentUser={currentUser}
          collaboration={collaboration}
          setShowTimeSlotsModal={setShowTimeSlotsModal}
          setShowUnavailableDatesModal={setShowUnavailableDatesModal}
          setShowCancelDialog={setShowCancelDialog}
        />
      </Tab>
      <Tab
        key="tasks"
        isDisabled={collaboration.isCancelled || collaboration.isCompleted}
        title={
          <div className="flex items-center gap-2">
            <FaClipboardList />
            <span>Tasks</span>
          </div>
        }
      >
        <TasksTab 
        collaboration={collaboration} 
        currentUser={currentUser}
        />
      </Tab>
      <Tab
        key="info"
        title={
          <div className="flex items-center gap-2">
            <FaUser />
            <span>{isMentorInCollab ? "Mentee Info" : "Mentor Info"}</span>
          </div>
        }
      >
        <InfoTab collaboration={collaboration} isMentor={isMentorInCollab} />
      </Tab>
    </Tabs>
  );
};

export default CollaborationTabs;