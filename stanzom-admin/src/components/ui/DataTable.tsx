import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  expandable?: (row: T) => ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  error,
  page = 1,
  totalPages = 1,
  onPageChange,
  onRowClick,
  rowClassName,
  expandable,
  emptyMessage = 'No data found',
}: DataTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-red/20 bg-red/5 p-8 text-red">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-sidebar">
              {expandable && <th className="w-10 px-3 py-3" />}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted',
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {expandable && <td className="px-3 py-3" />}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-border" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (expandable ? 1 : 0)}
                  className="px-4 py-12 text-center text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <>
                  <tr
                    key={index}
                    className={cn(
                      'border-b border-border transition-colors hover:bg-card/50',
                      onRowClick && 'cursor-pointer',
                      rowClassName?.(row),
                    )}
                    onClick={() => {
                      if (expandable) toggleRow(index);
                      else onRowClick?.(row);
                    }}
                  >
                    {expandable && (
                      <td className="px-3 py-3 text-muted">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(index);
                          }}
                          className="text-muted hover:text-text transition-colors"
                        >
                          {expandedRows.has(index) ? '−' : '+'}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 text-text', col.className)}>
                        {col.render
                          ? col.render(row, index)
                          : (row[col.key] as ReactNode) ?? '—'}
                      </td>
                    ))}
                  </tr>
                  {expandable && expandedRows.has(index) && (
                    <tr key={`${index}-expand`} className="border-b border-border bg-sidebar/50">
                      <td colSpan={columns.length + 1} className="px-6 py-4">
                        {expandable(row)}
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-xs text-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => onPageChange(1)}
            >
              <ChevronsLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => onPageChange(totalPages)}
            >
              <ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
