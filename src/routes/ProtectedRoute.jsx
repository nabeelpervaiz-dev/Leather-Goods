import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute() {
  const { isAuthenticated, authChecking } = useAuth();

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F3F1ED] flex items-center justify-center px-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#241811] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#625D57]">
            Verifying administrator session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
