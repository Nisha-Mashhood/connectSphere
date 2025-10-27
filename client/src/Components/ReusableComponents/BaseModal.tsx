import { FC, ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => Promise<void>;
  actionText?: string;
  cancelText?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  scrollBehavior?: "inside" | "outside";
}

const BaseModal: FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  actionText = "Submit",
  cancelText = "Cancel",
  size = "md",
  scrollBehavior = "outside",
}) => {
  const handleSubmit = async () => {
    if (onSubmit) {
      try {
        await onSubmit();
      } catch (error) {
        console.log(error)
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      scrollBehavior={scrollBehavior}
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            {cancelText}
          </Button>
          {onSubmit && (
            <Button color="primary" onPress={handleSubmit}>
              {actionText}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BaseModal;