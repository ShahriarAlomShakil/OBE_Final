import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AuthLayout Component
 * Layout for authentication pages (login, register, forgot password)
 * Features:
 * - Centered card layout
 * - Gradient background
 * - Logo at top
 * - Responsive design
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 overflow-hidden"></div>
      
      {/* Decorative Shapes - contained within viewport */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 -translate-x-1/2 translate-y-1/2"></div>

      {/* Main Content */}
      <div className="relative max-w-md w-full space-y-8">
        {/* Logo and Title Section */}
        <div className="text-center">
          {/* Logo */}
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center space-x-3">
              {/* Logo Icon */}
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              
              {/* Logo Text */}
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">
                  OBE System
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Outcome Based Education
                </p>
              </div>
            </div>
          </Link>

          {/* Page Title */}
          {title && (
            <div className="mt-8">
              <h2 className="text-3xl font-extrabold text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-10">
            {children}
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} OBE System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
