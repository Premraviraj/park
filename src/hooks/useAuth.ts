import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { localConfig, isAdminRoute } from '../config/localConfig';

export const useAuth = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = window.location.pathname;
    const isAdmin = user?.role === localConfig.roles.admin;
    const isAdminPath = isAdminRoute(pathname);

    // Redirect logic
    if (isAdminPath && !isAdmin) {
      // If trying to access admin route without admin rights
      navigate('/');
    } else if (!isAdminPath && isAdmin) {
      // Optional: Redirect admin to admin dashboard
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  return {
    isAuthenticated: !!user,
    isAdmin: user?.role === localConfig.roles.admin,
    user
  };
}; 