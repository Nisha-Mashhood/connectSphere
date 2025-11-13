import BaseModal from "../../../ReusableComponents/BaseModal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm?: () => void | Promise<void>;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
}) => (
  <BaseModal
    isOpen={isOpen}
    onClose={onClose}
    title={title}
    actionText="Confirm"
    cancelText="Cancel"
    onSubmit={
      onConfirm
        ? async () => {
            await onConfirm();
          }
        : undefined
    }
  >
    <p>{description}</p>
  </BaseModal>
);

export default ConfirmModal;
