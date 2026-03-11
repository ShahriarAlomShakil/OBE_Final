import React from 'react';

/**
 * Reusable Card Component
 * Container with header, body, and footer sections
 */
export const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'normal',
  hover = false,
}) => {
  // Base card classes
  const baseClasses = 'bg-white rounded-lg shadow-md';

  // Variant classes
  const variantClasses = {
    default: '',
    bordered: 'border-2 border-gray-200',
    flat: 'shadow-none',
  };

  // Hover effect
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    normal: 'p-6',
    lg: 'p-8',
  };

  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${paddingClasses[padding]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return <div className={cardClasses}>{children}</div>;
};

/**
 * Card Header Component
 */
export const CardHeader = ({ children, className = '', divider = true }) => {
  const headerClasses = `
    ${divider ? 'border-b border-gray-200 pb-4 mb-4' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return <div className={headerClasses}>{children}</div>;
};

/**
 * Card Title Component
 */
export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
};

/**
 * Card Subtitle Component
 */
export const CardSubtitle = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-600 mt-1 ${className}`}>
      {children}
    </p>
  );
};

/**
 * Card Body Component
 */
export const CardBody = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className = '', divider = true }) => {
  const footerClasses = `
    ${divider ? 'border-t border-gray-200 pt-4 mt-4' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return <div className={footerClasses}>{children}</div>;
};

/**
 * Card Actions Component (for buttons in footer)
 */
export const CardActions = ({ children, className = '', align = 'right' }) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`flex items-center gap-2 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
};
