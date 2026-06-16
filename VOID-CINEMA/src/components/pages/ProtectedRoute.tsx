import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader className="animate-spin text-neon-cyan" size={40} />
          <p className="text-neon-cyan font-mono tracking-[0.3em] uppercase text-sm animate-pulse">
            Verifying Authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
