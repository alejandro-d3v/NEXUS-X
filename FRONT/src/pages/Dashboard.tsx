import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { ActivityType } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const tools = [
    { type: ActivityType.EXAM, name: 'Generador de Exámenes', icon: '📝', description: 'Crea exámenes personalizados' },
    { type: ActivityType.SUMMARY, name: 'Generador de Resúmenes', icon: '📄', description: 'Resume textos largos' },
    { type: ActivityType.LESSON_PLAN, name: 'Plan de Lección', icon: '📚', description: 'Planifica tus clases' },
    { type: ActivityType.QUIZ, name: 'Generador de Quiz', icon: '❓', description: 'Crea cuestionarios interactivos' },
    { type: ActivityType.FLASHCARDS, name: 'Tarjetas de Estudio', icon: '🎴', description: 'Genera flashcards' },
    { type: ActivityType.ESSAY, name: 'Generador de Ensayos', icon: '✍️', description: 'Ayuda con ensayos' },
    { type: ActivityType.PRESENTATION, name: 'Presentaciones', icon: '📊', description: 'Crea presentaciones' },
    { type: ActivityType.WORKSHEET, name: 'Hojas de Trabajo', icon: '📋', description: 'Genera ejercicios' },
    { type: ActivityType.PROJECT, name: 'Proyectos', icon: '🎯', description: 'Planifica proyectos' },
    { type: ActivityType.RUBRIC, name: 'Rúbricas', icon: '📏', description: 'Crea rúbricas de evaluación' },
  ];

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Bienvenido, {user?.name}!</h1>
          <p style={styles.subtitle}>Selecciona una herramienta para comenzar</p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <h3>Créditos Disponibles</h3>
            <p style={styles.statValue}>{user?.credits}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Rol</h3>
            <p style={styles.statValue}>{user?.role}</p>
          </div>
        </div>

        <div style={styles.toolsGrid}>
          {/* Exam Generator - Special Link */}
          <Link
            to="/generate-exam"
            style={styles.toolCard}
          >
            <div style={styles.toolIcon}>📝</div>
            <h3 style={styles.toolName}>Generador de Exámenes</h3>
            <p style={styles.toolDescription}>Crea exámenes personalizados</p>
          </Link>

          {/* Summary Generator - Special Link */}
          <Link
            to="/generate-summary"
            style={styles.toolCard}
          >
            <div style={styles.toolIcon}>📄</div>
            <h3 style={styles.toolName}>Generador de Resúmenes</h3>
            <p style={styles.toolDescription}>Resume textos largos o PDFs</p>
          </Link>

          {/* Other tools */}
          {tools.slice(2).map((tool) => (
            <Link
              key={tool.type}
              to={`/generate?type=${tool.type}`}
              style={styles.toolCard}
            >
              <div style={styles.toolIcon}>{tool.icon}</div>
              <h3 style={styles.toolName}>{tool.name}</h3>
              <p style={styles.toolDescription}>{tool.description}</p>
            </Link>
          ))}
        </div>

        <div style={styles.quickLinks}>
          <Link to="/my-activities" style={styles.quickLink}>
            Ver Mis Actividades
          </Link>
          <Link to="/public-activities" style={styles.quickLink}>
            Explorar Actividades Públicas
          </Link>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1rem',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    margin: '0.5rem 0',
  },
  toolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  toolCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    textAlign: 'center' as const,
  },
  toolIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  toolName: {
    color: '#1a1a2e',
    marginBottom: '0.5rem',
  },
  toolDescription: {
    color: '#666',
    fontSize: '0.9rem',
  },
  quickLinks: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  quickLink: {
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
};
