import { Spinner } from '@nextui-org/react';
import { User, Group, CompleteMentorDetails, UserConnection, CollabDetails, Mentor, GroupMemberships, GroupRequest, Request } from '../../../redux/types';
import ExploreCard from '../../ReusableComponents/ExploreCard';
import { ButtonConfig } from '../../../pages/User/Explore/helpers/getButtonConfigs';

interface ExploreContentProps {
  activeTab: string;
  isLoading: boolean;
  mentors: CompleteMentorDetails[];
  users: User[];
  groups: Group[];
  userConnections: { sent: UserConnection[], received: UserConnection[] }
  mentorDetails: Mentor;
  collabDetails: CollabDetails;
  req: Request;
  groupMemberships: GroupMemberships;
  groupRequests: GroupRequest[];
  setSelectedMentor: (mentor: CompleteMentorDetails) => void;
  setSelectedUser: (user: User) => void;
  setSelectedGroup: (group: Group) => void;
  getMentorButtonConfig: (mentor: CompleteMentorDetails, mentorDetails: Mentor, collabDetails: CollabDetails, req: Request) => ButtonConfig;
  getUserButtonConfig: (user: User, userConnections: { sent: UserConnection[]; received: UserConnection[] }) => ButtonConfig;
  getGroupButtonConfig: (group: Group, groupMemberships: GroupMemberships, groupRequests: GroupRequest[]) => ButtonConfig;
}

const ExploreContent = ({
  activeTab,
  isLoading,
  mentors,
  users,
  groups,
  userConnections,
  mentorDetails,
  collabDetails,
  req,
  groupMemberships,
  groupRequests,
  setSelectedMentor,
  setSelectedUser,
  setSelectedGroup,
  getMentorButtonConfig,
  getUserButtonConfig,
  getGroupButtonConfig,
}: ExploreContentProps) => {
  const currentData = activeTab === 'mentors' ? mentors : activeTab === 'users' ? users : groups;

  const renderCard = (item: CompleteMentorDetails | User | Group) => {
    switch (activeTab) {
      case 'mentors':
        return (
          <ExploreCard
            key={item.id}
            item={item}
            type="mentor"
            getButtonConfig={(mentor: CompleteMentorDetails) =>
              getMentorButtonConfig(mentor, mentorDetails, collabDetails, req)
            }
            onButtonPress={setSelectedMentor}
          />
        );
      case 'users':
        return (
          <ExploreCard
            key={item.id}
            item={item}
            type="user"
            getButtonConfig={(user: User) => getUserButtonConfig(user, userConnections)}
            onButtonPress={setSelectedUser}
          />
        );
      case 'groups':
        return (
          <ExploreCard
            key={item.id}
            item={item}
            type="group"
            getButtonConfig={(group: Group) =>
              getGroupButtonConfig(group, groupMemberships, groupRequests)
            }
            onButtonPress={setSelectedGroup}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (currentData.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-default-700 mb-2">
          No {activeTab} found
        </h3>
        <p className="text-default-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
      {currentData.map(renderCard)}
    </div>
  );
};

export default ExploreContent;