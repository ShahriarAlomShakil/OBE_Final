import React, { forwardRef } from 'react';

/**
 * Reusable Input Component
 * Supports label, error messages, icons, and various types
 */
export const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  // Base input classes
  const baseInputClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
  
  // State-based classes
  const stateClasses = error
    ? 'border-danger-300 text-danger-900 placeholder-danger-300 focus:ring-danger-500 focus:border-danger-500'
    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500';
  
  // Size classes with icon padding
  const paddingClasses = icon
    ? iconPosition === 'left'
      ? 'pl-10 pr-3 py-2'
      : 'pl-3 pr-10 py-2'
    : 'px-3 py-2';

  // Disabled classes
  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed opacity-60'
    : 'bg-white';

  // Combined input classes
  const inputClasses = `
    ${baseInputClasses}
    ${stateClasses}
    ${paddingClasses}
    ${disabledClasses}
    ${inputClassName}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.isValidElement(icon) ? icon : React.createElement(icon, { className: "text-gray-400 h-5 w-5" })}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          {...props}
        />

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {React.isValidElement(icon) ? icon : React.createElement(icon, { className: "text-gray-400 h-5 w-5" })}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-danger-600">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
