import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";
import { cancelCollab } from "../../../../../Service/collaboration.Service";
import { fetchCollabDetails } from "../../../../../redux/Slice/profileSlice";

const CancelModal = ({ isOpen, onClose, reason, setReason, collabId, currentUser, dispatch, navigate }) => {
  const handleCancelMentorship = async () => {
    try {
      await cancelCollab(collabId, reason);
      await dispatch(fetchCollabDetails({ userId: currentUser._id, role: currentUser.role }));
      navigate("/profile");
    } catch (error) {
      console.error("Error cancelling mentorship:", error);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center">
      <ModalContent>
        <ModalHeader>Cancel Mentorship</ModalHeader>
        <ModalBody>
          <p>Are you sure you want to cancel this mentorship? This action cannot be undone.</p>
          <Textarea
            label="Reason for cancellation"
            placeholder="Please provide a reason for cancellation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            minRows={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>Close</Button>
          <Button color="danger" onPress={handleCancelMentorship} isDisabled={!reason.trim()}>
            Cancel Mentorship
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CancelModal;