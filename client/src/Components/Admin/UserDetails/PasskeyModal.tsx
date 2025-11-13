import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from "@nextui-org/react";
import { FaLock } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  passkey: string;
  setPasskey: (val: string) => void;
  onSubmit: () => void;
}

const PasskeyModal: React.FC<Props> = ({ isOpen, onClose, passkey, setPasskey, onSubmit }) => (
  <Modal isOpen={isOpen} onOpenChange={onClose} placement="center" backdrop="blur">
    <ModalContent>
      <ModalHeader className="flex items-center gap-2">
        <FaLock className="text-warning" />
        Admin Passkey Required
      </ModalHeader>
      <ModalBody>
        <Input
          label="Enter admin passkey"
          placeholder="••••••••"
          type="password"
          value={passkey}
          onValueChange={setPasskey}
          autoFocus
        />
      </ModalBody>
      <ModalFooter>
        <Button variant="light" onPress={onClose}>
          Cancel
        </Button>
        <Button color="primary" onPress={onSubmit}>
          Confirm
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

export default React.memo(PasskeyModal);