// src/components/Auth/RequireAuth.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { Navigate, useLocation } from 'react-router-dom';

function RequireAuth({ children }) {
  const { accessToken, isLoading } = useAuth(); // Берем accessToken и isLoading из контекста
  const location = useLocation();

  if (isLoading) {
    return <p>Проверка аутентификации...</p>; // Или любой другой индикатор загрузки
  }

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default RequireAuth;