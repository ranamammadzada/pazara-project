/**
 * Authentication Context
 * Kullanıcı oturum yönetimi
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('pazara_token'));

  // Sayfa yüklendiğinde kullanıcıyı kontrol et
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('pazara_token');
      if (savedToken) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const response = await api.get('/auth/me');
          if (response.data.success) {
            setUser(response.data.user);
            setToken(savedToken);
          }
        } catch (error) {
          localStorage.removeItem('pazara_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Giriş yap
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('pazara_token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(userData);
        toast.success(`Hoş geldiniz, ${userData.full_name || userData.username}! 👋`);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Giriş yapılamadı.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Kayıt ol
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem('pazara_token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken);
        setUser(newUser);
        toast.success('Hesabınız başarıyla oluşturuldu! 🎉');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Kayıt olunamadı.';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Çıkış yap
  const logout = () => {
    localStorage.removeItem('pazara_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    toast.success('Çıkış yapıldı. Görüşürüz! 👋');
  };

  // Profil güncelle
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.success) {
        setUser(prev => ({ ...prev, ...profileData }));
        toast.success('Profil güncellendi.');
        return { success: true };
      }
    } catch (error) {
      toast.error('Profil güncellenemedi.');
      return { success: false };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller' || user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
