import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

/**
 * Unauthorized Page
 * 
 * Displayed when user tries to access a route they don't have permission for.
 */
const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const requiredRoles = location.state?.requiredRoles || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-danger-100 p-6">
            <ShieldExclamationIcon className="h-16 w-16 text-danger-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Access Denied
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-2">
          You don't have permission to access this page.
        </p>

        {requiredRoles.length > 0 && (
          <p className="text-sm text-gray-500 mb-8">
            This page requires one of the following roles:{' '}
            <span className="font-semibold">
              {requiredRoles.join(', ')}
            </span>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Button
            variant="outline-primary"
            onClick={() => navigate(-1)}
            iconLeft={ArrowLeftIcon}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-700">
            If you believe you should have access to this page, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
