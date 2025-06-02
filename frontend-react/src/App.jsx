// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Путь к AuthContext
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ProfilePage from './pages/ProfilePage';
import RequireAuth from './components/Auth/RequireAuth';
import Header from './components/Layout/Header'; // Импортируем Header
import Footer from './components/Layout/Footer'; // Импортируем Footer
import Container from 'react-bootstrap/Container'; // Для основного контента
import './App.css'; // Ваши глобальные стили (если есть)

// Navigation компонент больше не нужен здесь, так как он теперь в Header.jsx

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        Загрузка приложения...
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
          </Routes>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;