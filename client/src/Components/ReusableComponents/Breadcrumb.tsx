import { ChevronRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {item.to ? (
            <Link
              to={item.to}
              className="hover:text-blue-600 hover:underline transition"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-gray-900">{item.label}</span>
          )}
          {index < items.length - 1 && (
            <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400" />
          )}
        </div>
      ))}
    </nav>
  );
}