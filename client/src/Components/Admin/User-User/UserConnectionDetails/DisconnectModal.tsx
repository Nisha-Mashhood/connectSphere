import { Textarea } from "@nextui-org/react";
import BaseModal from "../../../ReusableComponents/BaseModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  setReason: (value: string) => void;
  onConfirm: () => Promise<void>;
}

const DisconnectModal: React.FC<Props> = ({
  isOpen,
  onClose,
  reason,
  setReason,
  onConfirm,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Disconnect Connection"
      onSubmit={onConfirm}
      actionText="Disconnect"
      cancelText="Cancel"
    >
      <p>Are you sure you want to disconnect this connection?</p>
      <Textarea
        label="Reason for disconnecting"
        placeholder="Please provide a reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </BaseModal>
  );
};

export default DisconnectModal;