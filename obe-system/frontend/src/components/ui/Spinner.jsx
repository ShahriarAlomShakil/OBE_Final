import React from 'react';

/**
 * Reusable Spinner Component
 * Loading spinner with different sizes and colors
 */
export const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  // Color classes
  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-secondary-600',
    white: 'border-white',
    gray: 'border-gray-600',
    success: 'border-success-600',
    danger: 'border-danger-600',
    warning: 'border-warning-600',
  };

  const spinnerClasses = `
    animate-spin rounded-full border-2 border-t-transparent
    ${sizeClasses[size]}
    ${colorClasses[color]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={spinnerClasses} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Full Page Spinner (centered on screen)
 */
export const FullPageSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="xl" />
        <p className="mt-4 text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
};

/**
 * Inline Spinner with Text
 */
export const SpinnerWithText = ({
  text = 'Loading...',
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Spinner size={size} color={color} />
      <span className="text-gray-600">{text}</span>
    </div>
  );
};

/**
 * Button Spinner (for loading buttons)
 */
export const ButtonSpinner = ({ size = 'sm', className = '' }) => {
  return (
    <Spinner size={size} color="white" className={className} />
  );
};
