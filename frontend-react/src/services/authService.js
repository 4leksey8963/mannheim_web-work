// src/services/authService.js
import apiClient from './apiClient';

const AUTH_PATH = '/auth'; // Путь к эндпоинтам аутентификации относительно VITE_API_BASE_URL

export const login = async (credentials) => {
  try {
    const response = await apiClient.post(`${AUTH_PATH}/login`, credentials);
    return response.data; // { access_token, refresh_token, ... }
  } catch (error) {
    throw error.response?.data || error.message || 'Login failed';
  }
};

export const register = async (userData) => {
  try {
    const response = await apiClient.post(`${AUTH_PATH}/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || 'Registration failed';
  }
};

export const fetchUserProfile = async () => {
  // Токен уже будет добавлен интерцептором в apiClient
  try {
    const response = await apiClient.get(`${AUTH_PATH}/me`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message || 'Failed to fetch profile';
  }
};

export const refreshToken = async (currentRefreshToken) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${AUTH_PATH}/refresh`,
          { refresh_token: currentRefreshToken },
          {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
          }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message || 'Failed to refresh token';
    }
};

export const logout = async () => {
  try {
    const response = await apiClient.post(`${AUTH_PATH}/logout`);
    return response.data;
  } catch (error) {
    console.error("API logout error:", error.response?.data || error.message);
    return { message: "Logout called, client should clear local tokens." };
  }
};