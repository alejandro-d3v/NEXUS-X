import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaSpinner, FaLink, FaEye } from 'react-icons/fa';
import { activityService } from '../../services/activity.service';

interface Activity {
    id: string;
    title: string;
    description?: string;
    type: string;
    visibility: string;
    subject: string;
    gradeLevel?: string;
    createdAt: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    activityGrades?: Array<{
        grade: {
            name: string;
        };
    }>;
}

export const PublicActivitiesTeacher: React.FC = () => {
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
            const data = await activityService.getPublicActivitiesForTeachers();
            setActivities(data);
        } catch (error: any) {
            toast.error('Error al cargar actividades públicas');
            console.error(error);
        } finally {
            setLoading(false);
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
                    <h1>Public Activities</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Explore and assign activities created by other teachers
                    </p>
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
                    <p>No public activities available</p>
                </div>
            ) : (
                <div className="activities-grid">
                    {filteredActivities.map((activity) => (
                        <div key={activity.id} className="activity-card">
                            <div className="activity-card-header">
                                <h3>{activity.title}</h3>
                                <div className="activity-badges">
                                    <span className="badge badge-blue">{activity.type}</span>
                                    <span className="badge badge-green">🌍 Public</span>
                                </div>
                            </div>

                            {activity.description && (
                                <p className="activity-description">{activity.description}</p>
                            )}

                            <div className="activity-meta">
                                <span className="subject">{activity.subject}</span>
                                {activity.gradeLevel && (
                                    <span className="grade-level">📚 {activity.gradeLevel}</span>
                                )}
                            </div>

                            <div className="activity-creator">
                                <small>
                                    Created by: <strong>{activity.user?.firstName} {activity.user?.lastName}</strong>
                                </small>
                            </div>

                            <div className="activity-meta">
                                <span className="date">
                                    {new Date(activity.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="activity-actions">
                                <button
                                    onClick={() => navigate(`/teacher/activities/${activity.id}`)}
                                    className="btn btn-sm btn-primary"
                                    title="View details"
                                >
                                    <FaEye /> Ver
                                </button>
                                <button
                                    onClick={() => navigate(`/teacher/activities/${activity.id}/assign`)}
                                    className="btn btn-sm btn-secondary"
                                    title="Assign to grades"
                                >
                                    <FaLink /> Asignar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
