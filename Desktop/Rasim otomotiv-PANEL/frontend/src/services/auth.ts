import api from './api';
import { DEMO_USER, DEMO_CREDENTIALS, isDemoMode, enableDemoMode } from './demo';

// Local type definitions
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Demo mode check
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      enableDemoMode();
      return {
        user: DEMO_USER,
        accessToken: 'demo-token-' + Date.now(),
      };
    }

    // Real API call - disable demo mode for real logins
    localStorage.removeItem('demoMode');
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<AuthResponse> {
    // Disable demo mode for real registrations
    localStorage.removeItem('demoMode');
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<void> {
    if (isDemoMode()) {
      return;
    }
    await api.post('/auth/forgot-password', { email });
  },

  async getProfile(): Promise<User> {
    if (isDemoMode()) {
      return DEMO_USER;
    }
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },

  async updateProfile(data: { firstName?: string; lastName?: string }): Promise<User> {
    if (isDemoMode()) {
      const updatedUser = {
        ...DEMO_USER,
        ...data,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    const response = await api.patch<User>('/auth/profile', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('demoMode');
  },

  getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  storeAuth(data: AuthResponse) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  },

  async checkUserStatus(userId: string): Promise<{ isActive: boolean }> {
    try {
      const response = await api.get(`/users/${userId}/status`);
      return response.data;
    } catch (error) {
      return { isActive: false };
    }
  },
};
