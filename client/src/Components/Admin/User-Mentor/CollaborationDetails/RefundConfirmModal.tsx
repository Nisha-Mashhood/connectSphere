import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import { formatCurrency } from "../../../../pages/User/Profile/helper";

type Props = {
  isOpen: boolean;
  price: number;
  reason: string;
  onClose: () => void;
  onConfirm: () => void;
};

export const RefundConfirmModal = ({ isOpen, price, reason, onClose, onConfirm }: Props) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalContent>
      <ModalHeader>Confirm Refund & Cancellation</ModalHeader>
      <ModalBody>
       <p>
            A <strong>50% refund</strong> of{" "}
            <strong>{formatCurrency(price / 2)}</strong> will be processed.
        </p>
        <p className="text-sm text-gray-500 mt-2">Reason: {reason || "None"}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button color="danger" onPress={onConfirm}>
          Confirm Refund & Cancel
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);