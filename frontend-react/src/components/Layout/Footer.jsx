import React from 'react';
import Container from 'react-bootstrap/Container';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-3 mt-auto" style={{ backgroundColor: 'var(--secondary-bg-color)', color: 'var(--secondary-text-color)' }}>
      <Container className="text-center">
        <p className="mb-0">© {currentYear} Mannheim. <span style={{color: 'var(--accent-color)'}}>Все права защищены (наверное).</span></p>
      </Container>
    </footer>
  );
}

export default Footer;