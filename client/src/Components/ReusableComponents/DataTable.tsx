import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@nextui-org/react";
import Pagination from "./Pagination";
import React, { useMemo, useEffect } from "react";
import debounce from "lodash.debounce";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  emptyMessage?: string;
  topContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  total,
  page,
  limit,
  onPageChange,
  loading = false,
  onSearchChange,
  emptyMessage = "No data found.",
  bottomContent,
  onRowClick
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit) || 1;

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onSearchChange?.(value);
      }, 500),
    [onSearchChange]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);


  return (
    <div className="space-y-4">
      <Table isStriped aria-label="Data table">
        <TableHeader>
          {columns.map((col) => (
            <TableColumn key={String(col.key)}>{col.label}</TableColumn>
          ))}
        </TableHeader>
        <TableBody
          items={data}
          isLoading={loading}
          loadingContent={<Spinner label="Loading..." />}
          emptyContent={emptyMessage}
        >
          {(item) => (
            <TableRow 
            key={item.id}
            className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
            onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <TableCell key={String(col.key)}>
                  {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          limit={limit}
          total={total}
          onPageChange={(newPage) => {
            onPageChange(newPage);
          }}
        />
      )}

      {bottomContent}
    </div>
  );
}