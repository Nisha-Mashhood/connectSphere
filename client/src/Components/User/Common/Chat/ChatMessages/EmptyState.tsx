import { Contact } from "../../../../../types";
import { MessageSquare } from "lucide-react";

// Props for the EmptyState component
interface EmptyStateProps {
  selectedContact: Contact | null;
}

// Component to render when there are no messages or no contact is selected
const EmptyState: React.FC<EmptyStateProps> = ({ selectedContact }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div
        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 ${
          selectedContact
            ? "bg-gray-100 dark:bg-gray-800"
            : "bg-blue-50 dark:bg-blue-900/30"
        }`}
      >
        <MessageSquare
          size={20}
          className={
            selectedContact ? "text-gray-400 dark:text-gray-500" : "text-blue-500 dark:text-blue-400"
          }
        />
      </div>
      <p
        className={`text-center text-sm sm:text-base ${
          selectedContact ? "text-gray-500 dark:text-gray-400" : "text-gray-600 dark:text-gray-300"
        }`}
      >
        {selectedContact ? "No messages yet" : "Select a contact to start chatting"}
      </p>
      {selectedContact && (
        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm text-center mt-1">
          Send a message to start the conversation
        </p>
      )}
    </div>
  );
};

export default EmptyState;