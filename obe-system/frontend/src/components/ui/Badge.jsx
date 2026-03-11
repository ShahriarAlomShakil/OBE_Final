import React from 'react';

/**
 * Reusable Badge Component
 * Status badges with different variants and sizes
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  className = '',
  icon,
  dot = false,
}) => {
  // Base badge classes
  const baseClasses = 'inline-flex items-center font-medium';

  // Variant classes
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    info: 'bg-blue-100 text-blue-800',
    dark: 'bg-gray-800 text-white',
    light: 'bg-gray-50 text-gray-600 border border-gray-200',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  // Rounded classes
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';

  // Icon size classes
  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Dot size classes
  const dotSizeClasses = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5',
  };

  // Combined classes
  const badgeClasses = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.default}
    ${sizeClasses[size]}
    ${roundedClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={badgeClasses}>
      {/* Dot indicator */}
      {dot && (
        <span className={`${dotSizeClasses[size]} rounded-full bg-current mr-1.5`} />
      )}
      
      {/* Icon */}
      {icon && (
        <span className={`${iconSizeClasses[size]} mr-1`}>{icon}</span>
      )}
      
      {children}
    </span>
  );
};

/**
 * Status Badge Component (with predefined status colors)
 */
export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const statusConfig = {
    active: { variant: 'success', label: 'Active', dot: true },
    inactive: { variant: 'danger', label: 'Inactive', dot: true },
    pending: { variant: 'warning', label: 'Pending', dot: true },
    completed: { variant: 'success', label: 'Completed', dot: true },
    draft: { variant: 'default', label: 'Draft', dot: true },
    published: { variant: 'primary', label: 'Published', dot: true },
    archived: { variant: 'dark', label: 'Archived', dot: true },
  };

  const config = statusConfig[status.toLowerCase()] || {
    variant: 'default',
    label: status,
    dot: false,
  };

  return (
    <Badge
      variant={config.variant}
      size={size}
      dot={config.dot}
      className={className}
    >
      {config.label}
    </Badge>
  );
};

/**
 * Count Badge Component (for notifications, counts)
 */
export const CountBadge = ({ count, max = 99, variant = 'danger', className = '' }) => {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge
      variant={variant}
      size="sm"
      className={`min-w-[20px] justify-center ${className}`}
    >
      {displayCount}
    </Badge>
  );
};
