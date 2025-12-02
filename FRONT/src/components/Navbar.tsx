import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.logo}>
          NexusX
        </Link>
        <div style={styles.menu}>
          <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          <Link to="/my-activities" style={styles.link}>Mis Actividades</Link>
          <Link to="/public-activities" style={styles.link}>Actividades Públicas</Link>
          <Link to="/generate" style={styles.link}>Generar Actividad</Link>
          <div style={styles.userInfo}>
            <span style={styles.credits}>Créditos: {user.credits}</span>
            <span style={styles.userName}>{user.firstName} {user.lastName}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Cerrar Sesión</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#1a1a2e',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none',
  },
  menu: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    transition: 'color 0.3s',
  },
  userInfo: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginLeft: '1rem',
    paddingLeft: '1rem',
    borderLeft: '1px solid #444',
  },
  credits: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
  },
  logoutBtn: {
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
