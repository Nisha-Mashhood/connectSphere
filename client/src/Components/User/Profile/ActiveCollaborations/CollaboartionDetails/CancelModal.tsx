import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@nextui-org/react";
import { cancelAndRefundCollab } from "../../../../../Service/collaboration.Service";
import { fetchCollabDetails } from "../../../../../redux/Slice/profileSlice";
import { useState } from "react";
import toast from "react-hot-toast";

const CancelModal = ({ isOpen, onClose, reason, setReason, collabId, currentUser, dispatch, navigate, collaboration }) => {
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  const handleConfirmCancelAndRefund = async () => {
    console.log('Initiating cancel and refund:', { collabId, reason, amount: collaboration.price / 2 });
    try {
      await cancelAndRefundCollab(collabId, reason, collaboration.price / 2);
      console.log('Cancel and refund processed, fetching updated collab details');
      await dispatch(fetchCollabDetails({ userId: currentUser.id, role: currentUser.role }));
      navigate("/profile");
      toast.success("Mentorship cancelled with 50% refund");
    } catch (error) {
      console.error("Error processing cancel and refund:", error);
      toast.error("Failed to process cancellation and refund. Please try again.");
    }
    setShowRefundConfirm(false);
    onClose();
  };

  return (
    <>
      {/* Cancellation Reason Modal */}
      <Modal isOpen={isOpen && !showRefundConfirm} onClose={onClose} placement="center">
        <ModalContent>
          <ModalHeader>Cancel Mentorship</ModalHeader>
          <ModalBody>
            <p>Please provide a reason for cancelling this mentorship.</p>
            <Textarea
              label="Reason for cancellation"
              placeholder="Please provide a reason for cancellation"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minRows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Close
            </Button>
            <Button
              color="primary"
              onPress={() => {
                if (!reason.trim()) {
                  toast.error("Cancellation reason is required.");
                  return;
                }
                setShowRefundConfirm(true);
              }}
              isDisabled={!reason.trim()}
            >
              Proceed to Cancel and Refund
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Refund Confirmation Modal */}
      <Modal isOpen={showRefundConfirm} onClose={() => setShowRefundConfirm(false)} placement="center">
        <ModalContent>
          <ModalHeader>Confirm Cancellation and Refund</ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to cancel this mentorship? A 50% refund of Rs. 
              {collaboration?.price ? (collaboration.price / 2).toFixed(2) : "0.00"} will be
              processed.
            </p>
            <p className="text-sm text-gray-500">
              Reason: {reason || "Not provided"}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              variant="light"
              onPress={() => setShowRefundConfirm(false)}
            >
              Cancel
            </Button>
            <Button color="danger" onPress={handleConfirmCancelAndRefund}>
              Confirm Cancellation and Refund
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CancelModal;