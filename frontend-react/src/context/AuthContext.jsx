import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshTokenVal, setRefreshTokenVal] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true); 

  const updateTokens = (newAccessToken, newRefreshToken) => {
    setAccessToken(newAccessToken);
    localStorage.setItem('accessToken', newAccessToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

    if (newRefreshToken) {
      setRefreshTokenVal(newRefreshToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    }
  };

  const clearAuthData = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshTokenVal(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete apiClient.defaults.headers.common['Authorization'];
  }, []);


  const attemptRefreshToken = useCallback(async () => {
    if (!refreshTokenVal) {
      clearAuthData();
      throw new Error("No refresh token available");
    }
    try {
      setLoading(true);
      const tokens = await authService.refreshToken(refreshTokenVal);
      updateTokens(tokens.access_token, tokens.refresh_token);
      return tokens.access_token;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [refreshTokenVal, clearAuthData]);

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; // Устанавливаем заголовок для apiClient
        try {
          const profile = await authService.fetchUserProfile();
          setUser(profile);
        } catch (error) {
          console.error("Failed to fetch user on init:", error);
          if (error.message && error.message.toLowerCase().includes('unauthorized') || (error.response && error.response.status === 401) ) {
            try {
                console.log("Attempting to refresh token on init...");
                const newAccessToken = await attemptRefreshToken();
                // Если refresh успешен, токен и пользователь будут установлены в attemptRefreshToken/fetchUserProfile
                 const profile = await authService.fetchUserProfile(); // Повторный запрос с новым токеном
                 setUser(profile);
            } catch (refreshError) {
                console.log("Could not refresh token on init. Logging out.");
                // clearAuthData уже вызовется в attemptRefreshToken при ошибке
            }
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [accessToken, attemptRefreshToken]); 


  const login = async (credentials) => {
    setLoading(true);
    try {
      const tokens = await authService.login(credentials);
      updateTokens(tokens.access_token, tokens.refresh_token);
      const profile = await authService.fetchUserProfile(); // Загружаем профиль после установки токена
      setUser(profile);
      return profile;
    } catch (error) {
      clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const tokens = await authService.register(userData);
      updateTokens(tokens.access_token, tokens.refresh_token);
      const profile = await authService.fetchUserProfile(); // Загружаем профиль
      setUser(profile);
      return profile;
    } catch (error) {
      clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    if (accessToken) { // Вызываем серверный logout только если есть токен
        try {
            await authService.logout();
        } catch (error) {
            console.error("Error during server logout:", error);
            // Продолжаем локальный logout даже если API вызов не удался
        }
    }
    clearAuthData();
    setLoading(false);
    // Обычно здесь происходит перенаправление на страницу входа
    // navigate('/login'); // Если у вас есть доступ к navigate
  };

  const value = { user, accessToken, loading, login, register, logout, attemptRefreshToken, isLoading: loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};