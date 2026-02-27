import React, { useEffect, useMemo, useState } from 'react';

interface Column<T = any> {
  key: string;
  header: string;
  accessor?: string | ((row: T) => React.ReactNode);
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T, index: number) => void;
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  hoverable?: boolean;
  className?: string;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  enablePagination?: boolean;
  enableLazyLoad?: boolean;
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  lazyLoadPagesStep?: number;
}

function Table<T extends Record<string, any> = Record<string, any>>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  striped = true,
  hoverable = true,
  className = '',
  onSort,
  sortColumn,
  sortDirection,
  enablePagination = true,
  enableLazyLoad = true,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [10, 20, 50],
  lazyLoadPagesStep = 1,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [loadedPages, setLoadedPages] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    setLoadedPages(1);
  }, [data]);

  const totalPages = useMemo(() => {
    if (!enablePagination) return 1;
    return Math.max(1, Math.ceil(data.length / rowsPerPage));
  }, [data.length, enablePagination, rowsPerPage]);

  const maxVisiblePage = useMemo(() => {
    if (!enablePagination) return 1;
    if (!enableLazyLoad) return totalPages;
    return Math.min(totalPages, loadedPages);
  }, [enableLazyLoad, enablePagination, loadedPages, totalPages]);

  const safeCurrentPage = Math.min(currentPage, maxVisiblePage);

  useEffect(() => {
    if (currentPage > maxVisiblePage) {
      setCurrentPage(maxVisiblePage);
    }
  }, [currentPage, maxVisiblePage]);

  const pageStartIndex = enablePagination ? (safeCurrentPage - 1) * rowsPerPage : 0;
  const visibleRows = enablePagination
    ? data.slice(pageStartIndex, pageStartIndex + rowsPerPage)
    : data;

  const getCellValue = (row: T, column: Column<T>, absoluteIndex: number): React.ReactNode => {
    if (column.render) {
      return column.render(
        column.accessor
          ? typeof column.accessor === 'function'
            ? column.accessor(row)
            : row[column.accessor]
          : undefined,
        row,
        absoluteIndex
      );
    }
    if (column.accessor) {
      if (typeof column.accessor === 'function') return column.accessor(row);
      return row[column.accessor];
    }
    return null;
  };

  const handleSort = (columnKey: string) => {
    if (onSort && columns.find((col) => col.key === columnKey)?.sortable) {
      const newDirection =
        sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(columnKey, newDirection);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-10)' }}>
        Loading...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-10)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      <div
        className={className}
        style={{
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch' as any,
          borderRadius: 12,
          border: '1px solid var(--gray-6)',
          background: 'var(--gray-1)',
        }}
      >
        <table
          style={{
            width: '100%',
            minWidth: 480,
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
        {/* ── HEADER ── */}
        <thead>
          <tr style={{ borderBottom: '1px solid var(--gray-6)', background: 'var(--gray-2)' }}>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                style={{
                  padding: '12px 16px',
                  textAlign: column.align || 'left',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--gray-11)',
                  whiteSpace: 'nowrap',
                  cursor: column.sortable ? 'pointer' : 'default',
                  width: column.width,
                  userSelect: 'none',
                }}
              >
                {column.header}
                {column.sortable && sortColumn === column.key && (
                  <span style={{ marginLeft: 4 }}>
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── BODY ── */}
          <tbody>
            {visibleRows.map((row, rowIndex) => {
              const absoluteIndex = pageStartIndex + rowIndex;
              const rowKey = String((row as any)?._id ?? (row as any)?.id ?? absoluteIndex);
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(row, absoluteIndex)}
                  style={{
                    borderBottom: '1px solid var(--gray-4)',
                    backgroundColor:
                      striped && rowIndex % 2 !== 0
                        ? 'var(--gray-2)'
                        : 'transparent',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (hoverable)
                      e.currentTarget.style.backgroundColor = 'var(--accent-a3)';
                  }}
                  onMouseLeave={(e) => {
                    if (hoverable)
                      e.currentTarget.style.backgroundColor =
                        striped && rowIndex % 2 !== 0 ? 'var(--gray-2)' : 'transparent';
                  }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        padding: '12px 16px',
                        textAlign: column.align || 'left',
                        color: 'var(--gray-12)',
                        width: column.width,
                        maxWidth: column.width || 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {getCellValue(row, column, absoluteIndex)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {enablePagination && (
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--gray-11)',
            fontSize: 13,
          }}
        >
          <div>
            Showing {pageStartIndex + 1}-{Math.min(pageStartIndex + rowsPerPage, data.length)} of {data.length}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label htmlFor="table-rows-per-page">Rows:</label>
            <select
              id="table-rows-per-page"
              value={rowsPerPage}
              onChange={(e) => {
                const nextRowsPerPage = Number(e.target.value);
                setRowsPerPage(nextRowsPerPage);
                setCurrentPage(1);
                setLoadedPages(1);
              }}
              style={{
                border: '1px solid var(--gray-7)',
                borderRadius: 6,
                background: 'var(--gray-1)',
                color: 'var(--gray-12)',
                padding: '4px 6px',
              }}
            >
              {rowsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage <= 1}
              style={{
                border: '1px solid var(--gray-7)',
                background: 'var(--gray-1)',
                color: 'var(--gray-12)',
                borderRadius: 6,
                padding: '4px 10px',
                cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                opacity: safeCurrentPage <= 1 ? 0.5 : 1,
              }}
            >
              Prev
            </button>

            <span>
              Page {safeCurrentPage} / {maxVisiblePage}
              {maxVisiblePage < totalPages ? ` (loaded ${maxVisiblePage}/${totalPages})` : ''}
            </span>

            <button
              type="button"
              onClick={() => {
                if (safeCurrentPage < maxVisiblePage) {
                  setCurrentPage((prev) => Math.min(maxVisiblePage, prev + 1));
                  return;
                }
                if (enableLazyLoad && maxVisiblePage < totalPages) {
                  setLoadedPages((prev) => Math.min(totalPages, prev + lazyLoadPagesStep));
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                }
              }}
              disabled={!enableLazyLoad && safeCurrentPage >= totalPages}
              style={{
                border: '1px solid var(--gray-7)',
                background: 'var(--gray-1)',
                color: 'var(--gray-12)',
                borderRadius: 6,
                padding: '4px 10px',
                cursor: !enableLazyLoad && safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                opacity: !enableLazyLoad && safeCurrentPage >= totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>

            {enableLazyLoad && maxVisiblePage < totalPages && (
              <button
                type="button"
                onClick={() =>
                  setLoadedPages((prev) => Math.min(totalPages, prev + lazyLoadPagesStep))
                }
                style={{
                  border: '1px solid var(--accent-7)',
                  background: 'var(--accent-3)',
                  color: 'var(--accent-11)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                Load more
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
export type { Column, TableProps };
