import { Contact } from "../../../../../types";
import { BadgeCheckIcon, UsersIcon } from "lucide-react";

export interface ColorScheme {
  gradient: string;
  border: string;
  avatarBorder: string;
  divider: string;
  badge: {
    bg: string;
    text: string;
    icon: JSX.Element;
  };
}

export const useColorScheme = (contactType: Contact["type"] | undefined): ColorScheme => {
  switch (contactType) {
    case "user-mentor":
      return {
        gradient: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
        border: "border-blue-200 dark:border-blue-800",
        avatarBorder: "border-blue-500",
        divider: "bg-blue-200 dark:bg-blue-800",
        badge: {
          bg: "bg-blue-100 dark:bg-blue-900",
          text: "text-blue-700 dark:text-blue-300",
          icon: <BadgeCheckIcon size={14} className="text-blue-500 mr-1" />,
        },
      };
    case "user-user":
      return {
        gradient: "from-purple-50 to-fuchsia-50 dark:from-purple-950 dark:to-fuchsia-950",
        border: "border-purple-200 dark:border-purple-800",
        avatarBorder: "border-purple-500",
        divider: "bg-purple-200 dark:bg-purple-800",
        badge: {
          bg: "bg-purple-100 dark:bg-purple-900",
          text: "text-purple-700 dark:text-purple-300",
          icon: <UsersIcon size={14} className="text-purple-500 mr-1" />,
        },
      };
    case "group":
      return {
        gradient: "from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950",
        border: "border-emerald-200 dark:border-emerald-800",
        avatarBorder: "border-emerald-500",
        divider: "bg-emerald-200 dark:bg-emerald-800",
        badge: {
          bg: "bg-emerald-100 dark:bg-emerald-900",
          text: "text-emerald-700 dark:text-emerald-300",
          icon: <UsersIcon size={14} className="text-emerald-500 mr-1" />,
        },
      };
    default:
      return {
        gradient: "from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900",
        border: "border-gray-200 dark:border-gray-700",
        avatarBorder: "border-gray-500",
        divider: "bg-gray-200 dark:bg-gray-700",
        badge: {
          bg: "bg-gray-100 dark:bg-gray-800",
          text: "text-gray-700 dark:text-gray-300",
          icon: <UsersIcon size={14} className="text-gray-500 mr-1" />,
        },
      };
  }
};