import React from 'react';

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
}: TableProps<T>) {
  const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
    if (column.render) {
      return column.render(
        column.accessor
          ? typeof column.accessor === 'function'
            ? column.accessor(row)
            : row[column.accessor]
          : undefined,
        row,
        data.indexOf(row)
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
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
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
                  {getCellValue(row, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
export type { Column, TableProps };