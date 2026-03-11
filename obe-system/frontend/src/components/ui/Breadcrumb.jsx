import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

/**
 * Reusable Breadcrumb Component
 * Navigation breadcrumb for page hierarchy
 */
export const Breadcrumb = ({
  items = [],
  separator = <ChevronRightIcon className="h-4 w-4" />,
  homeIcon = true,
  className = '',
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex ${className}`}>
      <ol className="flex items-center space-x-2">
        {/* Home Icon (optional) */}
        {homeIcon && (
          <li>
            <Link
              to="/"
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Home"
            >
              <HomeIcon className="h-5 w-5" />
            </Link>
          </li>
        )}

        {/* Breadcrumb Items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Separator */}
              {(homeIcon || index > 0) && (
                <li className="flex items-center text-gray-400" aria-hidden="true">
                  {separator}
                </li>
              )}

              {/* Breadcrumb Item */}
              <li className="flex items-center">
                {isLast ? (
                  // Current page (not clickable)
                  <span
                    className="text-sm font-medium text-gray-900"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  // Clickable link
                  <Link
                    to={item.href}
                    className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

/**
 * Breadcrumb Item Component (for manual construction)
 */
export const BreadcrumbItem = ({ href, label, current = false }) => {
  if (current) {
    return (
      <span className="text-sm font-medium text-gray-900" aria-current="page">
        {label}
      </span>
    );
  }

  return (
    <Link
      to={href}
      className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-200"
    >
      {label}
    </Link>
  );
};

/**
 * Breadcrumb with custom separator
 */
export const BreadcrumbWithSlash = ({ items, className = '' }) => {
  return (
    <Breadcrumb
      items={items}
      separator={<span className="text-gray-400">/</span>}
      className={className}
    />
  );
};
