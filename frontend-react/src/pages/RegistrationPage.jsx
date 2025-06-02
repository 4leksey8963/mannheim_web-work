import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function RegistrationPage() {
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    password_confirmation: '',
    firstname: '',
    lastname: '',
    gender: '',
    city: '',
    car: '',
  });
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const { register, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    if (formData.password !== formData.password_confirmation) {
      setError("Пароли не совпадают!");
      return;
    }
    const dataToSend = { ...formData };
    if (!dataToSend.city) delete dataToSend.city;
    if (!dataToSend.car) delete dataToSend.car;

    try {
      await register(dataToSend);
      navigate('/profile');
    } catch (err) {
      if (err && err.errors) {
        setValidationErrors(err.errors);
        setError('Пожалуйста, исправьте ошибки в форме.');
      } else if (err && err.error) {
        setError(err.error);
      } else {
        setError(err.message || 'Произошла ошибка регистрации.');
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight: 'calc(100vh - 150px)'}}>
      <Card style={{ width: '35rem' }} className="shadow-lg">
        <Card.Body>
          <Card.Title as="h1" className="text-center mb-4" style={{color: 'var(--heading-text-color)'}}>Регистрация</Card.Title>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="reg-login">
                  <Form.Label>Логин:</Form.Label>
                  <Form.Control type="text" name="login" value={formData.login} onChange={handleChange} required isInvalid={!!validationErrors.login} disabled={authLoading}/>
                  <Form.Control.Feedback type="invalid">{validationErrors.login?.[0]}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="reg-email">
                  <Form.Label>Email:</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required isInvalid={!!validationErrors.email} disabled={authLoading}/>
                  <Form.Control.Feedback type="invalid">{validationErrors.email?.[0]}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="reg-password">
                    <Form.Label>Пароль (мин. 6 симв.):</Form.Label>
                    <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" isInvalid={!!validationErrors.password} disabled={authLoading}/>
                    <Form.Control.Feedback type="invalid">{validationErrors.password?.[0]}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="reg-password-confirmation">
                    <Form.Label>Подтвердите пароль:</Form.Label>
                    <Form.Control type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required minLength="6" disabled={authLoading}/>
                    </Form.Group>
                </Col>
            </Row>
            
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="reg-firstname">
                    <Form.Label>Имя:</Form.Label>
                    <Form.Control type="text" name="firstname" value={formData.firstname} onChange={handleChange} required isInvalid={!!validationErrors.firstname} disabled={authLoading}/>
                    <Form.Control.Feedback type="invalid">{validationErrors.firstname?.[0]}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="reg-lastname">
                    <Form.Label>Фамилия:</Form.Label>
                    <Form.Control type="text" name="lastname" value={formData.lastname} onChange={handleChange} required isInvalid={!!validationErrors.lastname} disabled={authLoading}/>
                    <Form.Control.Feedback type="invalid">{validationErrors.lastname?.[0]}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3" controlId="reg-gender">
              <Form.Label>Пол:</Form.Label>
              <Form.Control type="text" name="gender" value={formData.gender} onChange={handleChange} required isInvalid={!!validationErrors.gender} disabled={authLoading}/>
              <Form.Control.Feedback type="invalid">{validationErrors.gender?.[0]}</Form.Control.Feedback>
            </Form.Group>
            
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="reg-city">
                    <Form.Label>Город (необязательно):</Form.Label>
                    <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} disabled={authLoading}/>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="reg-car">
                    <Form.Label>Машина (необязательно):</Form.Label>
                    <Form.Control type="text" name="car" value={formData.car} onChange={handleChange} disabled={authLoading}/>
                    </Form.Group>
                </Col>
            </Row>


            {error && !Object.keys(validationErrors).length && <Alert variant="danger" className="mt-3 py-2">{error}</Alert>}
            {Object.keys(validationErrors).length > 0 && !error && <Alert variant="danger" className="mt-3 py-2">Пожалуйста, исправьте ошибки в форме.</Alert>}


            <div className="d-grid mt-4">
              <Button variant="danger" type="submit" disabled={authLoading}>
                {authLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </div>
          </Form>
          <div className="mt-3 text-center">
            <span style={{color: 'var(--secondary-text-color)'}}>Уже есть аккаунт? </span>
            <Link to="/login" style={{color: 'var(--link-color)'}}>Войти</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RegistrationPage;