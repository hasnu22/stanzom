import * as React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './table';
import { Input } from './input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
import { Button } from './button';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { label: string; value: string }[];
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

type SortDirection = 'asc' | 'desc' | null;

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Search...',
  onRowClick,
  pageSize: initialPageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState('');
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);
  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleColumnFilter = (key: string, value: string) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (value === '__all__') delete next[key];
      else next[key] = value;
      return next;
    });
    setCurrentPage(1);
  };

  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Global search
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => {
          const val = getNestedValue(row, col.key);
          return typeof val === 'string' && val.toLowerCase().includes(lower);
        })
      );
    }

    // Column filters
    for (const [key, filterValue] of Object.entries(columnFilters)) {
      result = result.filter((row) => {
        const val = getNestedValue(row, key);
        return String(val) === filterValue;
      });
    }

    // Sort
    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        const aVal = getNestedValue(a, sortKey);
        const bVal = getNestedValue(b, sortKey);
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, search, columnFilters, sortKey, sortDirection, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <ChevronsUpDown className="ml-1 inline h-3.5 w-3.5 text-(--color-muted)" />;
    if (sortDirection === 'asc') return <ChevronUp className="ml-1 inline h-3.5 w-3.5 text-(--color-gold)" />;
    return <ChevronDown className="ml-1 inline h-3.5 w-3.5 text-(--color-gold)" />;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-md bg-(--color-border)" />
        <div className="rounded-md border border-(--color-border)">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col.key}>
                    <div className="h-4 w-20 animate-pulse rounded bg-(--color-border)" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <div className="h-4 w-full animate-pulse rounded bg-(--color-border)" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-muted)" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        {columns
          .filter((col) => col.filterable && col.filterOptions)
          .map((col) => (
            <Select
              key={col.key}
              value={columnFilters[col.key] ?? '__all__'}
              onValueChange={(val) => handleColumnFilter(col.key, val)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={col.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All {col.label}</SelectItem>
                {col.filterOptions!.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
      </div>

      {/* Table */}
      <div className="rounded-md border border-(--color-border)">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(col.sortable && 'cursor-pointer select-none')}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-(--color-muted)">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => (
                <TableRow
                  key={idx}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.render
                        ? col.render(getNestedValue(row, col.key), row)
                        : (String(getNestedValue(row, col.key) ?? ''))}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-(--color-muted)">
          <span>Rows per page:</span>
          <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-(--color-muted)">
            Page {currentPage} of {totalPages} ({filteredData.length} results)
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export { DataTable };
