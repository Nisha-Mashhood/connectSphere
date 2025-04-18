import React from "react";
import { Card, CardBody } from "@nextui-org/react";
import { UsersIcon } from "lucide-react";

const EmptyState: React.FC = () => {
  return (
    <Card className="h-full shadow-xl rounded-xl md:rounded-none bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950 border border-indigo-100 dark:border-indigo-900">
      <CardBody className="p-4 sm:p-6 md:p-8 flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 mx-auto flex items-center justify-center">
            <UsersIcon size={20} className="text-indigo-600 dark:text-indigo-300" />
          </div>
          <p className="text-indigo-700 dark:text-indigo-300 text-sm sm:text-base font-medium">
            Select a contact to view details
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default EmptyState;