import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { activityService } from '../services/activity.service';
import { Activity } from '../types';

export const MyActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await activityService.getMyActivities();
      setActivities(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;

    try {
      await activityService.deleteActivity(id);
      setActivities(activities.filter(a => a.id !== id));
    } catch (err: any) {
      alert('Error al eliminar la actividad');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Mis Actividades</h1>
          <Link to="/generate" style={styles.createButton}>
            + Nueva Actividad
          </Link>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {activities.length === 0 ? (
          <div style={styles.empty}>
            <p>No tienes actividades aún</p>
            <Link to="/generate" style={styles.link}>Crear tu primera actividad</Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {activities.map((activity) => (
              <div key={activity.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3>{activity.title}</h3>
                  <span style={styles.badge}>{activity.type}</span>
                </div>
                {activity.description && (
                  <p style={styles.description}>{activity.description}</p>
                )}
                <div style={styles.meta}>
                  <span>Visibilidad: {activity.visibility}</span>
                  <span>IA: {activity.aiProvider}</span>
                </div>
                <div style={styles.date}>
                  {new Date(activity.createdAt).toLocaleDateString()}
                </div>
                <div style={styles.actions}>
                  <Link to={`/activity/${activity.id}`} style={styles.viewButton}>
                    Ver
                  </Link>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    style={styles.deleteButton}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  createButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4CAF50',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
  },
  link: {
    color: '#1a1a2e',
    textDecoration: 'underline',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '0.85rem',
  },
  description: {
    color: '#666',
    marginBottom: '1rem',
  },
  meta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  date: {
    fontSize: '0.85rem',
    color: '#999',
    marginBottom: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    textAlign: 'center' as const,
  },
  deleteButton: {
    flex: 1,
    padding: '0.5rem',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
