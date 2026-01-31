import React from 'react';
import { Table as RadixTable } from '@radix-ui/themes';


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
      if (typeof column.accessor === 'function') {
        return column.accessor(row);
      }
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
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <RadixTable.Root className={className}>
        <RadixTable.Header>
          <RadixTable.Row>
            {columns.map((column) => (
              <RadixTable.ColumnHeaderCell
                key={column.key}
                style={{
                  width: column.width,
                  textAlign: column.align || 'left',
                  cursor: column.sortable ? 'pointer' : 'default',
                }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {column.header}
                  {column.sortable && sortColumn === column.key && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </RadixTable.ColumnHeaderCell>
            ))}
          </RadixTable.Row>
        </RadixTable.Header>
        <RadixTable.Body>
          {data.map((row, rowIndex) => (
            <RadixTable.Row
              key={rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor:
                  striped && rowIndex % 2 === 0
                    ? 'rgba(0, 0, 0, 0.02)'
                    : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (hoverable) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (hoverable) {
                  e.currentTarget.style.backgroundColor =
                    striped && rowIndex % 2 === 0
                      ? 'rgba(0, 0, 0, 0.02)'
                      : 'transparent';
                }
              }}
            >
              {columns.map((column) => (
                <RadixTable.Cell
                  key={column.key}
                  style={{ 
                    textAlign: column.align || 'left',
                    width: column.width,
                  }}
                >
                  {getCellValue(row, column)}
                </RadixTable.Cell>
              ))}
            </RadixTable.Row>
          ))}
        </RadixTable.Body>
      </RadixTable.Root>
    </div>
  );
}

export default Table;
export type { Column, TableProps };