import { useGroupDetails } from "../../Hooks/Admin/useGroupDetails";
import ConfirmModal from "../../Components/Admin/GroupCollab/GroupCollabDetails/ConfirmModal";
import GroupAdminCard from "../../Components/Admin/GroupCollab/GroupCollabDetails/GroupAdminCard";
import GroupHeader from "../../Components/Admin/GroupCollab/GroupCollabDetails/GroupHeader";
import GroupMembersList from "../../Components/Admin/GroupCollab/GroupCollabDetails/GroupMembersList";
import GroupRequestDetails from "../../Components/Admin/GroupCollab/GroupCollabDetails/GroupRequestDetails";
import GroupSlots from "../../Components/Admin/GroupCollab/GroupCollabDetails/GroupSlots";

const GroupDetails = () => {
  const {
    group,
    request,
    loading,
    handleRemoveGroup,
    handleRemoveMember,
    handleRequestUpdate,
    modal,
  } = useGroupDetails();

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-blue-500 rounded-full" />
      </div>
    );

  if (!group)
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Group details not found.</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <GroupHeader group={group} onBack={() => history.back()} onDelete={handleRemoveGroup} />
      <GroupAdminCard admin={group.admin} />
      {group.availableSlots?.length > 0 && <GroupSlots slots={group.availableSlots} />}
      {group.membersDetails && (
        <GroupMembersList
          members={group.membersDetails}
          adminId={group.adminId}
          onRemove={handleRemoveMember}
          formatDate={formatDate}
        />
      )}
      {request && (
        <GroupRequestDetails
          request={request}
          onUpdate={handleRequestUpdate}
        />
      )}
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={modal.onClose}
        title={modal.modalTitle}
        description={modal.modalDescription}
        onConfirm={modal.confirmAction || undefined}
      />
    </div>
  );
};

export default GroupDetails;
