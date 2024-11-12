import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { localConfig } from '../config/localConfig';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: string;
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole === localConfig.roles.admin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 