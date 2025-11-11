import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from "@nextui-org/react";

type Props = {
  isOpen: boolean;
  reason: string;
  setReason: (v: string) => void;
  onClose: () => void;
  onProceed: () => void;
};

export const CancelReasonModal = ({ isOpen, reason, setReason, onClose, onProceed }: Props) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      <ModalHeader>Cancel Mentorship</ModalHeader>
      <ModalBody>
        <p className="mb-2">Please provide a reason for cancelling this mentorship.</p>
        <Textarea placeholder="Enter reason…" value={reason} onChange={(e) => setReason(e.target.value)} />
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onPress={onClose}>
          Close
        </Button>
        <Button color="primary" onPress={onProceed} isDisabled={!reason.trim()}>
          Proceed to Refund
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);