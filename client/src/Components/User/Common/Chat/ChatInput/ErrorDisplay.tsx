import React from "react";
import AlertTriangle from "./AlertTriangle";
import { ErrorDisplayProps } from "./types";

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="mb-2 py-2 px-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs sm:text-sm rounded-lg border border-red-200 dark:border-red-800/50 animate-fade-in flex items-center gap-2">
      <AlertTriangle size={14} />
      {error}
    </div>
  );
};

export default ErrorDisplay;