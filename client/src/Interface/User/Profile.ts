import { ReactNode } from "react";

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actionText?: string;
  onAction?: () => void;
  isActionDisabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  scrollBehavior?: "inside" | "normal" | "outside";
  cancelText?: string;
}