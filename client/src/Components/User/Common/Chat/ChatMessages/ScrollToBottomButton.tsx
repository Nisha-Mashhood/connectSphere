import { ChevronDown } from "lucide-react";

// Props for the ScrollToBottomButton component
interface ScrollToBottomButtonProps {
  show: boolean;
  onClick: () => void;
}

// Component to render the scroll-to-bottom button
const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      className="absolute bottom-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all transform hover:scale-105"
      onClick={onClick}
      aria-label="Scroll to bottom"
    >
      <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
    </button>
  );
};

export default ScrollToBottomButton;