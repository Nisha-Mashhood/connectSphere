import { FC, ReactNode } from "react";
import { Button } from "@nextui-org/react";

interface EmptyStateCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor?: "primary" | "success";
  onButtonClick: () => void;
}

const EmptyStateCard: FC<EmptyStateCardProps> = ({
  icon,
  title,
  description,
  buttonLabel,
  buttonColor = "primary",
  onButtonClick,
}) => (
  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
    <div className="p-2 rounded-lg bg-gray-50 text-gray-600 w-fit mx-auto mb-2">
      {icon}
    </div>
    <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{description}</p>
    <Button
      color={buttonColor}
      size="sm"
      variant="flat"
      onPress={onButtonClick}
    >
      {buttonLabel}
    </Button>
  </div>
);

export default EmptyStateCard;
