import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaFilePdf, FaSpinner, FaLink, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import { ExamViewer } from '../../components/ExamViewer';
import { exportService } from '../../services/export.service';

interface Activity {
    id: string;
    title: string;
    description?: string;
    type: string;
    visibility: string;
    subject: string;
    content: any;
    aiProvider: string;
    creditCost: number;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
    };
    activityGrades?: Array<{
        grade: {
            id: string;
            name: string;
        };
    }>;
}

export const ActivityDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    useAuth();

    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadActivity();
    }, [id]);

    const loadActivity = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/activities/${id}`);
            setActivity(response.data);
        } catch (error: any) {
            toast.error('Error al cargar actividad');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) return;

        try {
            await api.delete(`/activities/${id}`);
            toast.success('Actividad eliminada');
            navigate('/teacher/activities');
        } catch (error: any) {
            toast.error('Error al eliminar actividad');
        }
    };

    const exportToPDF = async () => {
        if (!id) return;
        setExporting(true);
        try {
            const blob = await exportService.exportToPdf(id);
            exportService.downloadFile(blob, `${activity?.title || 'actividad'}.pdf`);
            toast.success('Exportado a PDF exitosamente');
        } catch (err) {
            toast.error('Error al exportar a PDF');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaSpinner className="spinner" size={32} />
                    <p style={{ marginTop: '1rem', color: '#666' }}>Cargando...</p>
                </div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="page-container">
                <div className="error-message">
                    <p>Actividad no encontrada</p>
                    <button onClick={() => navigate('/teacher/activities')} className="btn btn-primary">
                        Volver a Actividades
                    </button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        // Handle EXAM type with ExamViewer
        if (activity.type === 'EXAM') {
            return (
                <div className="activity-content-exam">
                    <ExamViewer content={activity.content} title={activity.title} />
                </div>
            );
        }

        if (activity.type === 'SUMMARY') {
            // Parse content - handle multiple levels of JSON encoding
            let content = activity.content;

            // Parse if string (can be double-encoded)
            while (typeof content === 'string') {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    break; // Stop if can't parse anymore
                }
            }

            console.log('Parsed content:', content);

            // Extract summary text
            let summaryText = '';
            const summaryField = content.summary || content.resumen;

            if (summaryField) {
                if (Array.isArray(summaryField)) {
                    summaryText = summaryField.join('\n\n');
                } else if (typeof summaryField === 'string') {
                    summaryText = summaryField;
                }
            }

            // Extract key points
            let keyPoints: string[] = [];
            const keyPointsField = content.keyPoints || content.puntosClave;
            if (keyPointsField && Array.isArray(keyPointsField)) {
                keyPoints = keyPointsField;
            }

            return (
                <div className="activity-content-summary">
                    {summaryText && (
                        <div className="summary-section">
                            <h3>📝 Resumen Generado</h3>
                            <div className="summary-text">
                                {summaryText}
                            </div>
                        </div>
                    )}

                    {keyPoints.length > 0 && (
                        <div className="summary-section">
                            <h3>🔑 Puntos Clave</h3>
                            <ul className="key-points-list">
                                {keyPoints.map((point: string, idx: number) => (
                                    <li key={idx}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {content.wordCount && (
                        <div className="summary-section">
                            <h3>📊 Estadísticas</h3>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span className="stat-label">Texto Original</span>
                                    <span className="stat-value">{content.wordCount.original || 'N/A'} palabras</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Resumen</span>
                                    <span className="stat-value">{content.wordCount.summary} palabras</span>
                                </div>
                                {content.wordCount.original && (
                                    <div className="stat-card">
                                        <span className="stat-label">Reducción</span>
                                        <span className="stat-value">
                                            {Math.round((1 - content.wordCount.summary / content.wordCount.original) * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {content.originalText && (
                        <details className="summary-section collapsible">
                            <summary>📄 Ver Texto Original</summary>
                            <div className="original-text">
                                {content.originalText}
                            </div>
                        </details>
                    )}

                    {content.metadata && (
                        <div className="summary-section metadata">
                            <h3>ℹ️ Información</h3>
                            <div className="metadata-grid">
                                {content.metadata.summaryLength && (
                                    <div className="metadata-item">
                                        <strong>Longitud:</strong> {content.metadata.summaryLength}
                                    </div>
                                )}
                                {content.metadata.summaryStyle && (
                                    <div className="metadata-item">
                                        <strong>Estilo:</strong> {content.metadata.summaryStyle}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!summaryText && (
                        <div className="summary-section">
                            <h3>⚠️ Debug - Contenido Raw</h3>
                            <p style={{ color: '#666', marginBottom: '1rem' }}>
                                No se pudo extraer el resumen. Mostrando contenido raw:
                            </p>
                            <div className="activity-content-raw">
                                <pre>{JSON.stringify(content, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="activity-content-raw">
                <pre>{JSON.stringify(activity.content, null, 2)}</pre>
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="activity-detail-header">
                <button onClick={() => navigate(-1)} className="btn btn-link">
                    <FaArrowLeft /> Volver
                </button>

                <div className="header-info">
                    <h1>{activity.title}</h1>
                    {activity.description && <p className="description">{activity.description}</p>}

                    <div className="activity-meta-tags">
                        <span className="badge badge-blue">{activity.type}</span>
                        <span className="badge badge-gray">{activity.subject}</span>
                        <span className={`badge ${activity.visibility === 'PUBLIC' ? 'badge-green' : 'badge-orange'}`}>
                            {activity.visibility === 'PUBLIC' ? '🌍 Público' : '🔒 Privado'}
                        </span>
                        <span className="badge badge-purple">{activity.aiProvider}</span>
                    </div>

                    <div className="activity-info-row">
                        <span>Creado por: {activity.user.firstName} {activity.user.lastName}</span>
                        <span>Fecha: {new Date(activity.createdAt).toLocaleDateString()}</span>
                        <span>Créditos: {activity.creditCost}</span>
                    </div>

                    {activity.activityGrades && activity.activityGrades.length > 0 && (
                        <div className="assigned-to">
                            <strong>Asignado a:</strong>{' '}
                            {activity.activityGrades.map(ag => ag.grade.name).join(', ')}
                        </div>
                    )}
                </div>

                <div className="header-actions">
                    <button onClick={exportToPDF} disabled={exporting} className="btn btn-secondary">
                        <FaFilePdf /> Exportar PDF
                    </button>
                    <button onClick={() => navigate(`/teacher/activities/${id}/assign`)} className="btn btn-primary">
                        <FaLink /> Asignar
                    </button>
                    <button onClick={handleDelete} className="btn btn-danger">
                        <FaTrash /> Eliminar
                    </button>
                </div>
            </div>

            <div className="activity-detail-content">
                {renderContent()}
            </div>
        </div>
    );
};
