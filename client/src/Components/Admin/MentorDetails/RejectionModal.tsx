import React from "react";
import BaseModal from "../../ReusableComponents/BaseModal";
import { Textarea } from "@nextui-org/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  setReason: (val: string) => void;
  onSubmit: () => Promise<void>;
}

const RejectionModal: React.FC<Props> = ({ isOpen, onClose, reason, setReason, onSubmit }) => (
  <BaseModal
    isOpen={isOpen}
    onClose={onClose}
    title="Reject Mentor Request"
    onSubmit={onSubmit}
    actionText="Reject"
    cancelText="Cancel"
  >
    <Textarea
      placeholder="Enter reason for rejection"
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      minRows={3}
    />
  </BaseModal>
);

export default React.memo(RejectionModal);