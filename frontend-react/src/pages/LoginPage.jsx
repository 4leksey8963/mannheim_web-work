import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';

function LoginPage() {
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/profile";

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(credentials);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.errors) {
         setError(Object.values(err.errors).flat().join(' '));
      } else if (err.error) {
         setError(err.error);
      } else {
         setError(err.message || 'Произошла ошибка входа.');
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: 'calc(100vh - 150px)'}}> {/* Для центрирования по вертикали */}
      <Card style={{ width: '25rem' }} className="shadow-lg">
        <Card.Body>
          <Card.Title as="h1" className="text-center mb-4" style={{color: 'var(--heading-text-color)'}}>Вход</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="login-page-login">
              <Form.Label>Логин:</Form.Label>
              <Form.Control
                type="text"
                name="login"
                value={credentials.login}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="login-page-password">
              <Form.Label>Пароль:</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Form.Group>

            {error && <Alert variant="danger" className="mt-3 py-2">{error}</Alert>}

            <div className="d-grid mt-4">
              <Button variant="danger" type="submit" disabled={loading}>
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </div>
          </Form>
          <div className="mt-3 text-center">
            <span style={{color: 'var(--secondary-text-color)'}}>Нет аккаунта? </span>
            <Link to="/register" style={{color: 'var(--link-color)'}}>Зарегистрироваться</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;