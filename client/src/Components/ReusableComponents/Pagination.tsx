import { Button } from "@nextui-org/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({
  page,
  limit,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-600">
        Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
      </p>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="flat"
          isDisabled={page === 1}
          onPress={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === page ? "solid" : "flat"}
            color={p === page ? "primary" : "default"}
            onPress={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}

        <Button
          size="sm"
          variant="flat"
          isDisabled={page === totalPages}
          onPress={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}