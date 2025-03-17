import { Tabs, Tab } from "@nextui-org/react";
import { FaInfoCircle, FaClipboardList, FaUser } from "react-icons/fa";
import DetailsTab from "./DetailsTab";
import TasksTab from "./TasksTab";
import InfoTab from "./InfoTab";

const CollaborationTabs = ({
  activeTab,
  setActiveTab,
  collaboration,
  isMentor,
  currentUser,
  setShowTimeSlotsModal,
  setShowUnavailableDatesModal,
  setShowCancelDialog,
}) => (
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
        collaboration={collaboration}
        isMentor={isMentor}
        setShowTimeSlotsModal={setShowTimeSlotsModal}
        setShowUnavailableDatesModal={setShowUnavailableDatesModal}
        setShowCancelDialog={setShowCancelDialog}
      />
    </Tab>
    <Tab
      key="tasks"
      title={
        <div className="flex items-center gap-2">
          <FaClipboardList />
          <span>Tasks</span>
        </div>
      }
    >
      <TasksTab collaboration={collaboration} currentUser={currentUser} />
    </Tab>
    <Tab
      key="info"
      title={
        <div className="flex items-center gap-2">
          <FaUser />
          <span>{isMentor ? "Mentee Info" : "Mentor Info"}</span>
        </div>
      }
    >
      <InfoTab collaboration={collaboration} isMentor={isMentor} />
    </Tab>
  </Tabs>
);

export default CollaborationTabs;





