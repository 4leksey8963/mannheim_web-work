import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';

function Header() {
  const { accessToken, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 shadow-sm">
      <Container>
        <Navbar.Brand as={RouterLink} to="/" style={{ color: 'var(--accent-color)' }}>
          АвтоБлог
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={RouterLink} to="/" activeclassname="active">Главная</Nav.Link>
          </Nav>
          <Nav>
            {accessToken && user ? (
              <>
                <Nav.Link as={RouterLink} to="/profile" className="text-light">
                  Профиль ({user.login})
                </Nav.Link>
                <Button variant="outline-danger" size="sm" onClick={handleLogout} className="ms-2">
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={RouterLink} to="/login">Вход</Nav.Link>
                <Nav.Link as={RouterLink} to="/register">Регистрация</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;