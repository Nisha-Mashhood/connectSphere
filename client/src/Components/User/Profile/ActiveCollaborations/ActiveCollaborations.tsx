import { Tabs, Tab } from "@nextui-org/react";
import { useActiveCollaborations } from "../../../../Hooks/User/useActiveCollaborations";
import { MentorTabContent } from "./MentorTabContent";
import { UserTabContent } from "./UserTabContent";
import FeedbackModal from "../../../Forms/FeedbackModal";

const ActiveCollaborations = ({ handleProfileClick }: { handleProfileClick: (id: string) => void }) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    mentorOngoingCollabs,
    mentorCompletedCollabs,
    userOngoingCollabs,
    userCompletedCollabs,
    feedbackData,
    feedbackModalOpen,
    selectedCollab,
    handleCollabClick,
    handleFeedbackClick,
    handleFeedbackComplete,
    closeFeedbackModal,
  } = useActiveCollaborations(handleProfileClick);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      {currentUser.role === "mentor" ? (
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(String(key))}
          color="primary"
          variant="underlined"
        >
          <Tab key="asMentor" title="As Mentor">
            <MentorTabContent
              ongoing={mentorOngoingCollabs}
              completed={mentorCompletedCollabs}
              currentUser={currentUser}
              feedbackData={feedbackData}
              onCollabClick={handleCollabClick}
              onProfileClick={handleProfileClick}
              onFeedbackClick={handleFeedbackClick}
            />
          </Tab>
          <Tab key="asUser" title="As User">
            <UserTabContent
              ongoing={userOngoingCollabs}
              completed={userCompletedCollabs}
              currentUser={currentUser}
              feedbackData={feedbackData}
              onCollabClick={handleCollabClick}
              onProfileClick={handleProfileClick}
              onFeedbackClick={handleFeedbackClick}
            />
          </Tab>
        </Tabs>
      ) : (
        <UserTabContent
          ongoing={userOngoingCollabs}
          completed={userCompletedCollabs}
          currentUser={currentUser}
          feedbackData={feedbackData}
          onCollabClick={handleCollabClick}
          onProfileClick={handleProfileClick}
          onFeedbackClick={handleFeedbackClick}
        />
      )}

      {selectedCollab && (
        <FeedbackModal
          isOpen={feedbackModalOpen}
          onClose={closeFeedbackModal}
          collaborationData={selectedCollab}
          onComplete={handleFeedbackComplete}
        />
      )}
    </div>
  );
};

export default ActiveCollaborations;