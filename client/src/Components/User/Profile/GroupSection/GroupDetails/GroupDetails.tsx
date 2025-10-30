import { Card, CardHeader, CardBody, Divider, Spinner } from "@nextui-org/react";
import { FaCalendarAlt } from "react-icons/fa";
import { useGroupDetails } from "../../../../../Hooks/User/useGroupDetails";
import { GroupCover } from "./GroupCover";
import { GroupHeader } from "./GroupHeader";
import TaskManagement from "../../../TaskManagement/TaskManagemnt";
import { GroupInfoGrid } from "./GroupInfoGrid";
import { GroupRequestsSection } from "./GroupRequestsSection";
import { GroupMembersSection } from "./GroupMembersSection";

export const GroupDetails = () => {
  const {
    group,
    groupRequests,
    loading,
    error,
    currentUser,
    isAdmin,
    pendingCount,
    membersList,
    handleRequestUpdate,
    handleRemoveUser,
    handleExitGroup,
    handleDeleteGroup,
    handlePhotoUpload,
  } = useGroupDetails();

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (error || !group) return <p className="text-center text-danger py-10">{error || "Group not found"}</p>;

  const pendingRequests = groupRequests.filter(r => r.status === "Pending");
  const coverUpload = (e: React.ChangeEvent<HTMLInputElement>) => handlePhotoUpload(e, "cover");
  const profileUpload = (e: React.ChangeEvent<HTMLInputElement>) => handlePhotoUpload(e, "profile");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <GroupCover coverPic={group.coverPic} isAdmin={isAdmin} onUpload={coverUpload} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="relative -mt-32">
          <Card className="shadow-lg">
            <CardBody className="p-0">
              <GroupHeader
                group={group}
                isAdmin={isAdmin}
                pendingCount={pendingCount}
                onExit={handleExitGroup}
                onDelete={handleDeleteGroup}
                onPhotoUpload={profileUpload}
              />

              {/* Tasks */}
              <div className="px-6 py-6">
                <Card>
                  <CardHeader className="flex gap-3">
                    <FaCalendarAlt className="text-xl text-primary" />
                    <p className="text-lg font-semibold">My Tasks</p>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <TaskManagement context="group" currentUser={currentUser} contextData={group} />
                  </CardBody>
                </Card>
              </div>

              <Divider className="mx-6" />

              {/* Info Grid */}
              <div className="px-6 py-6">
                <GroupInfoGrid
                  group={group}
                  isAdmin={isAdmin}
                  pendingRequests={pendingRequests}
                  availableSlots={group.availableSlots || []}
                />
              </div>

              {/* Full Requests (Admin) */}
              {isAdmin && (
                <div className="px-6 pb-6">
                  <GroupRequestsSection
                    requests={groupRequests}
                    group={group}
                    onUpdate={handleRequestUpdate}
                  />
                </div>
              )}

              {/* Members */}
              <div className="px-6 pb-6">
                <GroupMembersSection
                  members={membersList}
                  isAdmin={isAdmin}
                  onRemove={handleRemoveUser}
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;