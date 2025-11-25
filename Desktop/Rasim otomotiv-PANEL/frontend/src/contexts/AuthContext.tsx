import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authService.getStoredUser();
    const token = authService.getStoredToken();

    if (storedUser && token) {
      setUser(storedUser);
      setLoading(false);
      // Optionally verify token by fetching profile (async, don't block)
      authService.getProfile()
        .then(profile => {
          setUser(profile);
          authService.storeAuth({ user: profile, accessToken: token });
        })
        .catch((error) => {
          console.error('Profile fetch error:', error);
          // Don't logout on error, keep stored user
          // Only logout if it's a 401 (unauthorized)
          if (error.response?.status === 401) {
            authService.logout();
            setUser(null);
          }
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login(email, password);
      authService.storeAuth(data);
      setUser(data.user);
      toast.success('Giriş başarılı!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Giriş başarısız';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success('Çıkış yapıldı');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    authService.storeAuth({ user: updatedUser, accessToken: authService.getStoredToken() || '' });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
