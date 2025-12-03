import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaFileWord, FaFilePdf, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

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
}

export const StudentActivityDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    useAuth();

    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);

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

    const exportToWord = () => {
        toast.success('Exportación a WORD próximamente');
    };

    const exportToPDF = () => {
        toast.success('Exportación a PDF próximamente');
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
                    <button onClick={() => navigate('/student/dashboard')} className="btn btn-primary">
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (activity.type === 'SUMMARY') {
            let content = activity.content;

            // Parse JSON if string
            while (typeof content === 'string') {
                try {
                    content = JSON.parse(content);
                } catch (e) {
                    break;
                }
            }

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
                            <h3>📝 Resumen</h3>
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
                        <span className="badge badge-purple">{activity.aiProvider}</span>
                    </div>

                    <div className="activity-info-row">
                        <span>👨‍🏫 Teacher: {activity.user.firstName} {activity.user.lastName}</span>
                        <span>📅 Fecha: {new Date(activity.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="header-actions">
                    <button onClick={exportToWord} className="btn btn-secondary">
                        <FaFileWord /> Exportar WORD
                    </button>
                    <button onClick={exportToPDF} className="btn btn-secondary">
                        <FaFilePdf /> Exportar PDF
                    </button>
                </div>
            </div>

            <div className="activity-detail-content">
                {renderContent()}
            </div>
        </div>
    );
};
