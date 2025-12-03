import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaPlus, FaSpinner, FaTrash, FaLink } from 'react-icons/fa';
import api from '../../services/api';

interface Activity {
    id: string;
    title: string;
    description?: string;
    type: string;
    visibility: string;
    subject: string;
    createdAt: string;
    activityGrades?: Array<{
        grade: {
            name: string;
        };
    }>;
}

export const MyActivities: React.FC = () => {
    const navigate = useNavigate();
    useAuth();

    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const response = await api.get('/activities/my-activities');
            setActivities(response.data);
        } catch (error: any) {
            toast.error('Error al cargar actividades');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) return;

        try {
            await api.delete(`/activities/${id}`);
            toast.success('Actividad eliminada');
            loadActivities();
        } catch (error: any) {
            toast.error('Error al eliminar actividad');
        }
    };

    const filteredActivities = activities.filter((activity) => {
        if (filter === 'all') return true;
        return activity.type === filter;
    });

    const activityTypes = [...new Set(activities.map((a) => a.type))];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>My Activities</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Manage your educational activities
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => navigate('/teacher/create-summary')}
                        className="btn btn-primary"
                    >
                        <FaPlus /> Create Summary
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({activities.length})
                </button>
                {activityTypes.map((type) => (
                    <button
                        key={type}
                        className={`filter-btn ${filter === type ? 'active' : ''}`}
                        onClick={() => setFilter(type)}
                    >
                        {type} ({activities.filter((a) => a.type === type).length})
                    </button>
                ))}
            </div>

            {/* Activities List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <FaSpinner className="spinner" size={32} />
                    <p style={{ marginTop: '1rem', color: '#666' }}>Loading...</p>
                </div>
            ) : filteredActivities.length === 0 ? (
                <div className="empty-state">
                    <p>No activities found</p>
                    <button
                        onClick={() => navigate('/teacher/create-summary')}
                        className="btn btn-primary"
                    >
                        <FaPlus /> Create Your First Activity
                    </button>
                </div>
            ) : (
                <div className="activities-grid">
                    {filteredActivities.map((activity) => (
                        <div key={activity.id} className="activity-card">
                            <div className="activity-card-header">
                                <h3>{activity.title}</h3>
                                <div className="activity-badges">
                                    <span className="badge badge-blue">{activity.type}</span>
                                    <span
                                        className={`badge ${activity.visibility === 'PUBLIC' ? 'badge-green' : 'badge-orange'
                                            }`}
                                    >
                                        {activity.visibility === 'PUBLIC' ? '🌍 Public' : '🔒 Private'}
                                    </span>
                                </div>
                            </div>

                            {activity.description && (
                                <p className="activity-description">{activity.description}</p>
                            )}

                            <div className="activity-meta">
                                <span className="subject">{activity.subject}</span>
                                <span className="date">
                                    {new Date(activity.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {activity.activityGrades && activity.activityGrades.length > 0 && (
                                <div className="assigned-grades">
                                    <small>Assigned to:</small>
                                    <div className="grades-list">
                                        {activity.activityGrades.map((ag, idx) => (
                                            <span key={idx} className="grade-tag">
                                                {ag.grade.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="activity-actions">
                                <button
                                    onClick={() => navigate(`/teacher/activities/${activity.id}`)}
                                    className="btn btn-sm btn-primary"
                                    title="View details"
                                >
                                    👁️ Ver
                                </button>
                                <button
                                    onClick={() => navigate(`/teacher/activities/${activity.id}/assign`)}
                                    className="btn btn-sm btn-secondary"
                                    title="Assign to grades"
                                >
                                    <FaLink /> Asignar
                                </button>
                                <button
                                    onClick={() => handleDelete(activity.id)}
                                    className="btn btn-sm btn-danger"
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
