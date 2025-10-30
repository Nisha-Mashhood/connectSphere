import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "@nextui-org/react";
import { useGroupDashboard } from "../../../../../Hooks/User/useGroupDashboard";
import { GroupHeader } from "./GroupHeader";
import { GroupTabs } from "./GroupTabs";

export const GroupDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("tasks");
  const {
    group,
    groupRequests,
    loading,
    error,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    currentUser,
    pendingCount,
    handleRequestUpdate,
    handleRemoveUser,
    handleDeleteGroup,
    handleConfirmDelete,
    handlePhotoUpload,
    isProcessing,
  } = useGroupDashboard();

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (error || !group) return <p className="text-center text-danger">{error || "Group not found"}</p>;

  const isAdmin = group.adminId === currentUser.id;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <GroupHeader
        group={group}
        isAdmin={isAdmin}
        onDelete={handleDeleteGroup}
        onPhotoUpload={handlePhotoUpload}
      />

      <GroupTabs
        group={group}
        groupRequests={groupRequests}
        currentUser={currentUser}
        isAdmin={isAdmin}
        pendingCount={pendingCount}
        selectedTab={selectedTab}
        onTabChange={(k) => setSelectedTab(String(k))}
        onRequestUpdate={handleRequestUpdate}
        onRemoveUser={handleRemoveUser}
        onDeleteGroup={handleDeleteGroup}
        onPhotoUpload={handlePhotoUpload}
        isProcessing={isProcessing}
      />

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Delete Group?</ModalHeader>
          <ModalBody>
            <p>This action is permanent. All data will be lost.</p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button color="danger" onPress={handleConfirmDelete}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default GroupDashboard;