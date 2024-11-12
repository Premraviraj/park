export const localConfig = {
  baseUrl: 'http://localhost:3000',
  adminUrl: 'http://admin.localhost:3000',
  api: {
    baseUrl: 'http://localhost:8080/api',
    endpoints: {
      auth: '/auth',
      dashboard: '/dashboard',
      analytics: '/analytics'
    }
  },
  roles: {
    admin: 'ADMIN',
    user: 'USER'
  }
};

export const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith('/admin');
};

export const getBaseUrl = (role: string): string => {
  return role === localConfig.roles.admin ? localConfig.adminUrl : localConfig.baseUrl;
}; 