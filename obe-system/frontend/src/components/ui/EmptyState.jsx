import React from 'react';
import {
  DocumentIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';

/**
 * Reusable EmptyState Component
 * Displays when no data is available
 */
export const EmptyState = ({
  icon: CustomIcon,
  title = 'No data available',
  message,
  action,
  actionLabel,
  onAction,
  variant = 'default',
  className = '',
}) => {
  // Icon variants
  const defaultIcons = {
    default: InboxIcon,
    search: MagnifyingGlassIcon,
    folder: FolderOpenIcon,
    document: DocumentIcon,
  };

  const Icon = CustomIcon || defaultIcons[variant] || defaultIcons.default;

  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <Icon className="h-16 w-16 text-gray-400" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>

      {/* Message */}
      {message && (
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          {message}
        </p>
      )}

      {/* Action Button */}
      {(action || (actionLabel && onAction)) && (
        <div className="mt-6">
          {action || (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Empty Search Results
 */
export const EmptySearchResults = ({ searchTerm, onClear }) => {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      message={
        searchTerm
          ? `We couldn't find any results for "${searchTerm}". Try adjusting your search.`
          : 'Try searching with different keywords.'
      }
      actionLabel={onClear ? 'Clear search' : undefined}
      onAction={onClear}
    />
  );
};

/**
 * Empty List State
 */
export const EmptyList = ({ title, message, actionLabel, onAction }) => {
  return (
    <EmptyState
      variant="folder"
      title={title || 'No items yet'}
      message={message || 'Get started by creating your first item.'}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
};

/**
 * No Data Available State
 */
export const NoData = ({ message = 'No data available at the moment.' }) => {
  return (
    <EmptyState
      variant="document"
      title="No Data"
      message={message}
    />
  );
};
