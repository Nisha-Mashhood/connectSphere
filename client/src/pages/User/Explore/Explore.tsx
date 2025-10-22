import HeaderSection from './sections/HeaderSection';
import SearchFilterSection from './sections/SearchFilterSection';
import TabsSection from './sections/TabsSection';
import ResultsSummary from './sections/ResultsSummary';
import ExploreContent from './sections/ExploreContent';
import ExplorePagination from './sections/ExplorePagination';
import { getMentorButtonConfig, getUserButtonConfig, getGroupButtonConfig } from './helpers/getButtonConfigs';
import ExploreModal from '../../../Components/ReusableComponents/ExploreModal';
import RequestStatusHandler from '../../../Components/User/UserComponents/HelperComponents/RequestStatusHandler';
import { useExploreMentors } from '../../../Hooks/User/useExploreMentors';

const ExploreMentors = () => {
  const {
    currentUser,
    mentorDetails,
    collabDetails,
    req,
    groupRequests,
    groupMemberships,
    userConnections,
    mentors,
    users,
    groups,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    mentorPagination,
    setMentorPagination,
    userPagination,
    setUserPagination,
    groupPagination,
    setGroupPagination,
    activeTab,
    handleSelectionChange,
    filterTypes,
    handleSearchChange,
    getCurrentTotal,
    isLoading,
    selectedMentor,
    setSelectedMentor,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    selectedSlot,
    setSelectedSlot,
    setLockedSlots,
    handleRequestMentor,
    handleRequestUser,
    handleRequestGroup,
    isSlotLocked,
  } = useExploreMentors();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <RequestStatusHandler currentUser={currentUser} />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <HeaderSection />
        <SearchFilterSection
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearchChange={handleSearchChange}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterTypes={filterTypes}
        />
        <TabsSection
          activeTab={activeTab}
          handleSelectionChange={handleSelectionChange}
          mentorPagination={mentorPagination}
          userPagination={userPagination}
          groupPagination={groupPagination}
        />
        <ResultsSummary
          activeTab={activeTab}
          getCurrentTotal={getCurrentTotal}
          searchQuery={searchQuery}
        />
        <ExploreContent
          activeTab={activeTab}
          isLoading={isLoading}
          mentors={mentors}
          users={users}
          groups={groups}
          userConnections={userConnections}
          mentorDetails={mentorDetails}
          collabDetails={collabDetails}
          req={req}
          groupMemberships={groupMemberships}
          groupRequests={groupRequests}
          setSelectedMentor={setSelectedMentor}
          setSelectedUser={setSelectedUser}
          setSelectedGroup={setSelectedGroup}
          getMentorButtonConfig={getMentorButtonConfig}
          getUserButtonConfig={getUserButtonConfig}
          getGroupButtonConfig={getGroupButtonConfig}
        />
        <ExplorePagination
          activeTab={activeTab}
          mentorPagination={mentorPagination}
          setMentorPagination={setMentorPagination}
          userPagination={userPagination}
          setUserPagination={setUserPagination}
          groupPagination={groupPagination}
          setGroupPagination={setGroupPagination}
        />
        <ExploreModal
          isOpen={!!selectedMentor || !!selectedUser || !!selectedGroup}
          onClose={() => {
            setSelectedMentor(null);
            setSelectedUser(null);
            setSelectedGroup(null);
            setSelectedSlot('');
            setLockedSlots([]);
          }}
          type={selectedMentor ? 'mentor' : selectedUser ? 'user' : 'group'}
          selectedItem={selectedMentor || selectedUser || selectedGroup}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
          isSlotLocked={isSlotLocked}
          onAction={
            selectedMentor
              ? handleRequestMentor
              : selectedUser
              ? handleRequestUser
              : handleRequestGroup
          }
          actionText={
            selectedMentor
              ? 'Book Session'
              : selectedUser
              ? 'Send Request'
              : 'Request to Join'
          }
          isActionDisabled={selectedMentor ? !selectedSlot : false}
        />
      </div>
    </div>
  );
};

export default ExploreMentors;