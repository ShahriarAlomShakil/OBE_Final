import React from 'react';
import { Spinner } from './Spinner';

/**
 * Reusable Button Component
 * Supports multiple variants, sizes, and states
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-sm hover:shadow-md',
    outline: 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    'outline-primary': 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    'outline-secondary': 'bg-white border-2 border-secondary-600 text-secondary-600 hover:bg-secondary-50 focus:ring-secondary-500',
    'outline-danger': 'bg-white border-2 border-danger-600 text-danger-600 hover:bg-danger-50 focus:ring-danger-500',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-sm hover:shadow-md',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm hover:shadow-md',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-sm hover:shadow-md',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    'ghost-primary': 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combined classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size]}
    ${widthClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Render icon as component if it's a function/component
  const IconComponent = icon;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size} className="mr-2" />
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <IconComponent className={`${iconSizeClasses[size]} mr-2`} />
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <IconComponent className={`${iconSizeClasses[size]} ml-2`} />
          )}
        </>
      )}
    </button>
  );
};
