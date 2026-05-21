import api from './api';

export const authService = {
  login: async (credentials: Record<string, unknown>) => {
    try {
      const response = await api.post('/auth/login-password', credentials);
      if (response.data.data.accessToken) {
        localStorage.setItem('token', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      throw err.response?.data || { message: 'Network Error' };
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await api.post('/auth/refresh', { refreshToken });
      if (response.data.data.accessToken) {
        localStorage.setItem('token', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      // Clear tokens if refresh fails
      authService.logout();
      throw err.response?.data || { message: 'Token refresh failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  changePassword: async (data: Record<string, unknown>) => {
    try {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    } catch (error: unknown) {
      const err = error as any;
      throw err.response?.data || { message: 'Network Error' };
    }
  },
};
