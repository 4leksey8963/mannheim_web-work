import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner'; // Для индикатора загрузки

function ProfilePage() {
  const { user, accessToken, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: 'calc(100vh - 150px)'}}>
            <Spinner animation="border" role="status" variant="light">
                <span className="visually-hidden">Загрузка профиля...</span>
            </Spinner>
        </div>
    );
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: 'calc(100vh - 150px)'}}>
        <Card style={{ width: '30rem' }} className="shadow-lg">
        <Card.Header as="h2" className="text-center" style={{backgroundColor: 'var(--secondary-bg-color)', color: 'var(--heading-text-color)'}}>
            Профиль пользователя
        </Card.Header>
        <Card.Body>
            <ListGroup variant="flush">
            <ListGroup.Item><strong>ID:</strong> {user.id}</ListGroup.Item>
            <ListGroup.Item><strong>Логин:</strong> {user.login}</ListGroup.Item>
            <ListGroup.Item><strong>Email:</strong> {user.email}</ListGroup.Item>
            <ListGroup.Item><strong>Имя:</strong> {user.firstname || 'Не указано'}</ListGroup.Item>
            <ListGroup.Item><strong>Фамилия:</strong> {user.lastname || 'Не указано'}</ListGroup.Item>
            <ListGroup.Item><strong>Пол:</strong> {user.gender || 'Не указано'}</ListGroup.Item>
            {user.city && <ListGroup.Item><strong>Город:</strong> {user.city}</ListGroup.Item>}
            {user.car && <ListGroup.Item><strong>Машина:</strong> {user.car}</ListGroup.Item>}
            </ListGroup>
            <Button variant="outline-danger" onClick={logout} className="mt-4 w-100">
                Выйти
            </Button>
        </Card.Body>
        </Card>
    </div>
  );
}

export default ProfilePage;