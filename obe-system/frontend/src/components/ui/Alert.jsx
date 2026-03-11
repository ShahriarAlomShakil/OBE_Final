import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Reusable Alert Component
 * Displays success, error, warning, and info messages
 */
export const Alert = ({
  type = 'info',
  title,
  message,
  onClose,
  icon: customIcon,
  className = '',
  children,
}) => {
  // Icon configuration
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  };

  // Color configuration
  const colors = {
    success: {
      bg: 'bg-success-50',
      border: 'border-success-200',
      text: 'text-success-800',
      icon: 'text-success-500',
      title: 'text-success-900',
    },
    error: {
      bg: 'bg-danger-50',
      border: 'border-danger-200',
      text: 'text-danger-800',
      icon: 'text-danger-500',
      title: 'text-danger-900',
    },
    warning: {
      bg: 'bg-warning-50',
      border: 'border-warning-200',
      text: 'text-warning-800',
      icon: 'text-warning-500',
      title: 'text-warning-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-500',
      title: 'text-blue-900',
    },
  };

  const Icon = customIcon || icons[type];
  const colorScheme = colors[type];

  return (
    <div
      className={`
        ${colorScheme.bg}
        ${colorScheme.border}
        border rounded-lg p-4
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${colorScheme.icon}`} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${colorScheme.title}`}>
              {title}
            </h3>
          )}
          {message && (
            <div className={`${title ? 'mt-1' : ''} text-sm ${colorScheme.text}`}>
              {message}
            </div>
          )}
          {children && (
            <div className={`${title || message ? 'mt-2' : ''} text-sm ${colorScheme.text}`}>
              {children}
            </div>
          )}
        </div>

        {/* Close Button */}
        {onClose && (
          <div className="ml-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className={`
                inline-flex rounded-lg p-1.5
                ${colorScheme.text}
                hover:bg-opacity-20 hover:bg-gray-900
                focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-${type}-500
              `}
              aria-label="Dismiss"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Simple Alert Component (without title, inline message)
 */
export const SimpleAlert = ({ type = 'info', message, className = '' }) => {
  const colors = {
    success: 'bg-success-50 text-success-800 border-success-200',
    error: 'bg-danger-50 text-danger-800 border-danger-200',
    warning: 'bg-warning-50 text-warning-800 border-warning-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div
      className={`
        ${colors[type]}
        border rounded-lg px-4 py-3 text-sm
        ${className}
      `}
      role="alert"
    >
      {message}
    </div>
  );
};

/**
 * Alert List Component (for multiple alerts)
 */
export const AlertList = ({ alerts = [], onDismiss, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map((alert, index) => (
        <Alert
          key={alert.id || index}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          onClose={() => onDismiss && onDismiss(alert.id || index)}
        />
      ))}
    </div>
  );
};
