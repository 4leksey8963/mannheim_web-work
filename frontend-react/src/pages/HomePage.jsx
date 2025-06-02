import React from 'react';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from 'react-bootstrap/Container';

const CustomJumbotron = ({ children }) => (
    <div className="p-5 mb-4 rounded-3 shadow-sm" style={{backgroundColor: 'var(--secondary-bg-color)'}}>
        <Container fluid className="py-5 text-center">
            {children}
        </Container>
    </div>
);

function HomePage() {
  const { accessToken } = useAuth();
  return (
    <CustomJumbotron>
      <h1 className="display-4 fw-bold" style={{color: 'var(--accent-color)'}}>Добро пожаловать в Автомобильный Блог <span style={{color: 'white'}}>Mannheim!</span></h1>
      <p className="fs-5 col-lg-8 mx-auto" style={{color: 'var(--secondary-text-color)'}}>
        Здесь вы найдете интересные статьи, обзоры и сможете поделиться своим мнением об автомобилях.
        Присоединяйтесь к нашему сообществу автолюбителей!
      </p>
      <hr className="my-4" />
      <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
        {!accessToken ? (
          <Link to="/register">
            <Button variant="danger" size="lg" className="px-4 gap-3">Присоединиться</Button>
          </Link>
        ) : (
          <Link to="/profile">
              <Button variant="outline-light" size="lg" className="px-4">Мой профиль</Button>
          </Link>
        )}
      </div>
    </CustomJumbotron>
  );
}
export default HomePage;