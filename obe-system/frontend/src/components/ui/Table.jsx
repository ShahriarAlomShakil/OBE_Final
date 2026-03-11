import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

/**
 * Reusable Table Component
 * Supports sortable columns, pagination, and loading state
 */
export const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  sortable = true,
  striped = false,
  hover = true,
  compact = false,
  className = '',
  onRowClick,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Handle column sort
  const handleSort = (columnKey) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig]);

  // Table classes
  const tableClasses = `
    min-w-full divide-y divide-gray-200
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Row classes
  const getRowClasses = (index) => {
    const baseClasses = 'border-b border-gray-200 transition-colors duration-150';
    const hoverClasses = hover ? 'hover:bg-gray-50 cursor-pointer' : '';
    const stripedClasses = striped && index % 2 === 1 ? 'bg-gray-50' : '';
    
    return `${baseClasses} ${hoverClasses} ${stripedClasses}`.trim().replace(/\s+/g, ' ');
  };

  // Cell padding
  const cellPadding = compact ? 'px-4 py-2' : 'px-6 py-4';

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className={tableClasses}>
        {/* Table Head */}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`
                  ${cellPadding}
                  text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable !== false && sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''}
                  ${column.className || ''}
                `}
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable !== false && sortable && (
                    <span className="flex flex-col">
                      <ChevronUpIcon
                        className={`h-3 w-3 ${
                          sortConfig.key === column.key && sortConfig.direction === 'asc'
                            ? 'text-primary-600'
                            : 'text-gray-400'
                        }`}
                      />
                      <ChevronDownIcon
                        className={`h-3 w-3 -mt-1 ${
                          sortConfig.key === column.key && sortConfig.direction === 'desc'
                            ? 'text-primary-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            // Loading State
            <tr>
              <td colSpan={columns.length} className="px-6 py-12">
                <div className="flex items-center justify-center">
                  <Spinner size="lg" />
                  <span className="ml-3 text-gray-500">Loading...</span>
                </div>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            // Empty State
            <tr>
              <td colSpan={columns.length} className="px-6 py-8">
                <EmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            // Data Rows
            sortedData.map((row, index) => (
              <tr
                key={row.id || index}
                className={getRowClasses(index)}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      ${cellPadding}
                      text-sm text-gray-900
                      ${column.cellClassName || ''}
                    `}
                  >
                    {column.render
                      ? column.render(row[column.key], row, index)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Loading Skeleton for Table
 */
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
