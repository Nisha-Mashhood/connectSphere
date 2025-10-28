import { CollabData, Feedback, User } from "../../../../redux/types";
import { CollaborationCard } from "./CollaborationCard";

interface Props {
  ongoing: CollabData[];
  completed: CollabData[];
  currentUser: User;
  feedbackData: Record<string, Feedback>;
  onCollabClick: (id: string) => void;
  onProfileClick: (id: string) => void;
  onFeedbackClick: (e: React.MouseEvent, collab: CollabData) => void;
}

export const MentorTabContent = ({
  ongoing,
  completed,
  currentUser,
  feedbackData,
  onCollabClick,
  onProfileClick,
  onFeedbackClick,
}: Props) => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Ongoing (As Mentor)</h2>
    <div className="space-y-4 mb-8">
      {ongoing.map((c) => (
        <CollaborationCard
          key={c.id}
          collab={c}
          isCompleted={false}
          currentUser={currentUser}
          feedbackData={feedbackData}
          onCollabClick={onCollabClick}
          onProfileClick={onProfileClick}
          onFeedbackClick={onFeedbackClick}
        />
      ))}
      {ongoing.length === 0 && <p className="text-center text-gray-500 py-4">No ongoing collaborations</p>}
    </div>

    <h2 className="text-2xl font-semibold mb-4">Completed (As Mentor)</h2>
    <div className="space-y-4">
      {completed.map((c) => (
        <CollaborationCard
          key={c.id}
          collab={c}
          isCompleted={true}
          currentUser={currentUser}
          feedbackData={feedbackData}
          onCollabClick={onCollabClick}
          onProfileClick={onProfileClick}
          onFeedbackClick={onFeedbackClick}
        />
      ))}
      {completed.length === 0 && <p className="text-center text-gray-500 py-4">No completed collaborations</p>}
    </div>
  </div>
);