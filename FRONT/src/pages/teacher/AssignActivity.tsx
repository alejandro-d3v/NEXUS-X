import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';

interface Activity {
    id: string;
    title: string;
    description?: string;
    type: string;
    visibility: string;
    subject: string;
    activityGrades?: ActivityGrade[];
}

interface ActivityGrade {
    id: string;
    gradeId: string;
    assignedAt: string;
    grade: {
        id: string;
        name: string;
        subject?: string;
    };
}

interface Grade {
    id: string;
    name: string;
    subject?: string;
    level?: string;
}

export const AssignActivity: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    useAuth(); // Ensure authentication

    const [activity, setActivity] = useState<Activity | null>(null);
    const [availableGrades, setAvailableGrades] = useState<Grade[]>([]);
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load activity
            const activityRes = await api.get(`/activities/${id}`);
            setActivity(activityRes.data);

            // Load teacher's grades
            const gradesRes = await api.get('/grades/my-grades');
            setAvailableGrades(gradesRes.data);

            // Pre-select already assigned grades
            if (activityRes.data.activityGrades) {
                const assignedGradeIds = activityRes.data.activityGrades.map(
                    (ag: ActivityGrade) => ag.gradeId
                );
                setSelectedGrades(assignedGradeIds);
            }
        } catch (error: any) {
            toast.error('Error al cargar datos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleGrade = (gradeId: string) => {
        setSelectedGrades((prev) =>
            prev.includes(gradeId)
                ? prev.filter((id) => id !== gradeId)
                : [...prev, gradeId]
        );
    };

    const handleSave = async () => {
        if (!activity) return;

        setSaving(true);
        try {
            await api.post(`/activities/${activity.id}/assign-grades`, {
                gradeIds: selectedGrades,
            });

            toast.success('Asignaciones guardadas exitosamente');
            navigate('/teacher/activities');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al guardar asignaciones');
        } finally {
            setSaving(false);
        }
    };

    const isAssigned = (gradeId: string) => {
        return activity?.activityGrades?.some((ag) => ag.gradeId === gradeId) || false;
    };

    const getAssignmentDate = (gradeId: string) => {
        const assignment = activity?.activityGrades?.find((ag) => ag.gradeId === gradeId);
        return assignment ? new Date(assignment.assignedAt).toLocaleDateString() : null;
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

    const currentlyAssigned = activity.activityGrades || [];
    const hasChanges = JSON.stringify(selectedGrades.sort()) !==
        JSON.stringify(currentlyAssigned.map(ag => ag.gradeId).sort());

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-link"
                        style={{ padding: 0, marginBottom: '0.5rem' }}
                    >
                        <FaArrowLeft /> Volver
                    </button>
                    <h1>Asignar Actividad a Grados</h1>
                </div>
            </div>

            {/* Activity Info */}
            <div className="assign-activity-container">
                <div className="activity-info-card">
                    <h3>{activity.title}</h3>
                    {activity.description && <p className="description">{activity.description}</p>}
                    <div className="activity-meta">
                        <span className="badge badge-blue">{activity.type}</span>
                        <span className="badge badge-gray">{activity.subject}</span>
                        <span className={`badge ${activity.visibility === 'PUBLIC' ? 'badge-green' : 'badge-orange'}`}>
                            {activity.visibility === 'PUBLIC' ? '🌍 Público' : '🔒 Privado'}
                        </span>
                    </div>
                </div>

                {/* Currently Assigned */}
                {currentlyAssigned.length > 0 && (
                    <div className="assigned-section">
                        <h3>Actualmente Asignado a:</h3>
                        <div className="assigned-grades-list">
                            {currentlyAssigned.map((ag) => (
                                <div key={ag.id} className="assigned-grade-item">
                                    <div>
                                        <strong>{ag.grade.name}</strong>
                                        {ag.grade.subject && <span className="subject"> • {ag.grade.subject}</span>}
                                    </div>
                                    <small className="date">
                                        Asignado: {new Date(ag.assignedAt).toLocaleDateString()}
                                    </small>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Grade Selection */}
                <div className="grade-selection-section">
                    <h3>Seleccionar Grados:</h3>

                    {availableGrades.length === 0 ? (
                        <div className="empty-state">
                            <p>No tienes grados disponibles.</p>
                            <button
                                onClick={() => navigate('/teacher/grades')}
                                className="btn btn-primary"
                            >
                                Crear Grado
                            </button>
                        </div>
                    ) : (
                        <div className="grades-grid">
                            {availableGrades.map((grade) => {
                                const isSelected = selectedGrades.includes(grade.id);
                                const wasAssigned = isAssigned(grade.id);
                                const assignmentDate = getAssignmentDate(grade.id);

                                return (
                                    <div
                                        key={grade.id}
                                        className={`grade-card ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleGrade(grade.id)}
                                    >
                                        <div className="grade-card-header">
                                            <div className="checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleGrade(grade.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="grade-info">
                                                <h4>{grade.name}</h4>
                                                {grade.subject && <p className="subject">{grade.subject}</p>}
                                                {grade.level && <span className="level">{grade.level}</span>}
                                            </div>
                                        </div>

                                        {wasAssigned && assignmentDate && (
                                            <div className="assignment-status">
                                                <FaCheckCircle color="#10b981" />
                                                <small>Asignado: {assignmentDate}</small>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="assignment-summary">
                    <div className="summary-stats">
                        <div className="stat">
                            <span className="stat-value">{selectedGrades.length}</span>
                            <span className="stat-label">Grados Seleccionados</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{currentlyAssigned.length}</span>
                            <span className="stat-label">Asignaciones Actuales</span>
                        </div>
                    </div>

                    {hasChanges && (
                        <div className="changes-notice">
                            <FaTimesCircle color="#f59e0b" />
                            <span>Tienes cambios sin guardar</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="form-actions">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                        disabled={saving || !hasChanges}
                    >
                        {saving ? (
                            <>
                                <FaSpinner className="spinner" /> Guardando...
                            </>
                        ) : (
                            'Guardar Asignaciones'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
