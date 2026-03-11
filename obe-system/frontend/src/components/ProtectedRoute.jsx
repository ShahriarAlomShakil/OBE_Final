import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { useHasHydrated } from '@/store/authStore';
import { Spinner } from '@/components/ui';

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication and/or specific roles.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string|string[]} props.requiredRoles - Optional role(s) required to access the route
 * @param {string} props.redirectTo - Where to redirect if not authorized (default: /login)
 * 
 * @example
 * // Require authentication only
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Require specific role
 * <ProtectedRoute requiredRoles="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * @example
 * // Require one of multiple roles
 * <ProtectedRoute requiredRoles={['admin', 'hod', 'teacher']}>
 *   <CourseManagement />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, requiredRoles = null, redirectTo = '/login' }) => {
  const { isAuthenticated, user, isAuthorized } = useAuth();
  const hasHydrated = useHasHydrated();
  const location = useLocation();

  // Show loading spinner while store is hydrating from localStorage
  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based authorization if requiredRoles is specified
  if (requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!isAuthorized(roles)) {
      // User is authenticated but doesn't have the required role
      // Redirect to unauthorized page or dashboard
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ from: location, requiredRoles: roles }} 
          replace 
        />
      );
    }
  }

  // User is authenticated and authorized (if role check was required)
  return children;
};

export default ProtectedRoute;
