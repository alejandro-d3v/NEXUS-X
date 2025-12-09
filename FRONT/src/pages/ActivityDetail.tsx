import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ExamViewer } from '../components/ExamViewer';
import { activityService } from '../services/activity.service';
import { exportService } from '../services/export.service';
import { Activity } from '../types';
import { useAuth } from '../context/AuthContext';

export const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (id) {
      loadActivity(id);
    }
  }, [id]);

  const loadActivity = async (activityId: string) => {
    try {
      const data = await activityService.getActivity(activityId);
      setActivity(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar la actividad');
    } finally {
      setLoading(false);
    }
  };

  const handleExportWord = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const blob = await exportService.exportToWord(id);
      exportService.downloadFile(blob, `${activity?.title || 'actividad'}.docx`);
    } catch (err) {
      alert('Error al exportar a Word');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const blob = await exportService.exportToExcel(id);
      exportService.downloadFile(blob, `${activity?.title || 'actividad'}.xlsx`);
    } catch (err) {
      alert('Error al exportar a Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const blob = await exportService.exportToPdf(id);
      exportService.downloadFile(blob, `${activity?.title || 'actividad'}.pdf`);
    } catch (err) {
      alert('Error al exportar a PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('¿Estás seguro de eliminar esta actividad?')) return;

    try {
      await activityService.deleteActivity(id);
      navigate('/my-activities');
    } catch (err) {
      alert('Error al eliminar la actividad');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div style={styles.error}>{error}</div>;
  if (!activity) return <div>Actividad no encontrada</div>;

  const isOwner = user?.id === activity.userId;

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1>{activity.title}</h1>
            <div style={styles.meta}>
              <span style={styles.badge}>{activity.type}</span>
              <span style={styles.badge}>{activity.visibility}</span>
              <span style={styles.badge}>{activity.aiProvider}</span>
            </div>
          </div>
          <div style={styles.actions}>
            <button onClick={handleExportWord} disabled={exporting} style={styles.exportButton}>
              📄 Exportar Word
            </button>
            <button onClick={handleExportExcel} disabled={exporting} style={styles.exportButton}>
              📊 Exportar Excel
            </button>
            <button onClick={handleExportPdf} disabled={exporting} style={styles.exportButton}>
              📑 Exportar PDF
            </button>
            {isOwner && (
              <button onClick={handleDelete} style={styles.deleteButton}>
                🗑️ Eliminar
              </button>
            )}
          </div>
        </div>

        {activity.description && (
          <div style={styles.description}>
            <h3>Descripción</h3>
            <p>{activity.description}</p>
          </div>
        )}


        {/* Exam Content with ExamViewer */}
        {activity.type === 'EXAM' ? (
          <div style={styles.content}>
            <ExamViewer content={activity.content} title={activity.title} />
          </div>
        ) : (
          <div style={styles.content}>
            <h3>Contenido</h3>
            <div style={styles.contentBox}>
              <pre style={styles.pre}>
                {JSON.stringify(activity.content, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div style={styles.footer}>
          <p>Creado por: {activity.user?.firstName} {activity.user?.lastName || 'Usuario'}</p>
          <p>Fecha: {new Date(activity.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '2rem',
    gap: '2rem',
  },
  meta: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '12px',
    fontSize: '0.85rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  exportButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  description: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  content: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  contentBox: {
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    borderRadius: '4px',
    maxHeight: '600px',
    overflow: 'auto',
  },
  pre: {
    whiteSpace: 'pre-wrap' as const,
    wordWrap: 'break-word' as const,
    fontFamily: 'inherit',
    margin: 0,
  },
  footer: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: '#666',
    fontSize: '0.9rem',
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '4px',
    margin: '2rem',
  },
};
