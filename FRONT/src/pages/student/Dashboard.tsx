import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUser, FaGraduationCap, FaChalkboardTeacher, FaSpinner, FaEye } from 'react-icons/fa';
import api from '../../services/api';

interface Activity {
    id: string;
    title: string;
    description?: string;
    type: string;
    subject: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
    };
}

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courseActivities, setCourseActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourseActivities();
    }, []);

    const fetchCourseActivities = async () => {
        try {
            setLoading(true);
            // Get activities assigned to student's grade
            const response = await api.get('/activities/student');
            setCourseActivities(response.data);
        } catch (error: any) {
            toast.error('Error al cargar actividades');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const studentProfile = user?.studentProfile;
    const grade = studentProfile?.grade;
    const institution = studentProfile?.institution;
    const teacher = grade?.teacher;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Welcome back, {user?.firstName}! 👋</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Here's your student dashboard
                    </p>
                </div>
            </div>

            {/* Profile and Grade Info Cards */}
            <div className="info-cards-grid">
                {/* Profile Card */}
                <div className="info-card">
                    <div className="info-card-header">
                        <FaUser className="info-card-icon" style={{ color: '#10b981' }} />
                        <h3>My Profile</h3>
                    </div>
                    <div className="info-card-body">
                        <div className="info-row">
                            <span className="info-label">Name:</span>
                            <span className="info-value">{user?.firstName} {user?.lastName}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{user?.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Student ID:</span>
                            <span className="info-value">{studentProfile?.studentId || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Credits:</span>
                            <span className="info-value">{user?.credits || 0}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Status:</span>
                            <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                                {user?.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                    <div className="info-card-footer">
                        <Link to="/student/profile" className="btn btn-sm btn-primary">
                            View Full Profile
                        </Link>
                    </div>
                </div>

                {/* Grade Info Card */}
                <div className="info-card">
                    <div className="info-card-header">
                        <FaGraduationCap className="info-card-icon" style={{ color: '#3b82f6' }} />
                        <h3>My Course</h3>
                    </div>
                    <div className="info-card-body">
                        {grade ? (
                            <>
                                <div className="info-row">
                                    <span className="info-label">Grade:</span>
                                    <span className="info-value">{grade.name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Subject:</span>
                                    <span className="info-value">{grade.subject || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Level:</span>
                                    <span className="info-value">{grade.level || 'N/A'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Institution:</span>
                                    <span className="info-value">{institution?.name || 'N/A'}</span>
                                </div>
                                {teacher && (
                                    <div className="info-row">
                                        <span className="info-label">Teacher:</span>
                                        <span className="info-value">
                                            {teacher.user?.firstName} {teacher.user?.lastName}
                                        </span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p style={{ color: '#999', textAlign: 'center', padding: '1rem' }}>
                                No course assigned yet. Please contact your administrator.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Course Activities */}
            <div className="section-card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>📚 My Course Activities</h2>
                    {courseActivities.length > 0 && (
                        <span className="badge badge-blue" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                            {courseActivities.length} {courseActivities.length === 1 ? 'Activity' : 'Activities'}
                        </span>
                    )}
                </div>

                {!grade ? (
                    <div className="empty-state">
                        <FaGraduationCap size={48} color="#ccc" />
                        <p>You are not enrolled in any course yet</p>
                        <p style={{ color: '#999', fontSize: '0.9rem' }}>
                            Please contact your teacher or administrator to join a course
                        </p>
                    </div>
                ) : loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <FaSpinner className="spinner" size={32} />
                        <p style={{ marginTop: '1rem', color: '#666' }}>Loading activities...</p>
                    </div>
                ) : courseActivities.length === 0 ? (
                    <div className="empty-state">
                        <FaChalkboardTeacher size={48} color="#ccc" />
                        <p>No activities assigned yet</p>
                        <p style={{ color: '#999', fontSize: '0.9rem' }}>
                            Your teacher hasn't assigned any activities to your course yet
                        </p>
                    </div>
                ) : (
                    <div className="activities-grid">
                        {courseActivities.map((activity) => (
                            <div key={activity.id} className="activity-card">
                                <div className="activity-card-header">
                                    <h3>{activity.title}</h3>
                                    <div className="activity-badges">
                                        <span className="badge badge-blue">{activity.type}</span>
                                        <span className="badge badge-gray">{activity.subject}</span>
                                    </div>
                                </div>

                                {activity.description && (
                                    <p className="activity-description">{activity.description}</p>
                                )}

                                <div className="activity-meta">
                                    <span className="teacher">
                                        👨‍🏫 {activity.user.firstName} {activity.user.lastName}
                                    </span>
                                    <span className="date">
                                        {new Date(activity.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="activity-actions">
                                    <button
                                        onClick={() => navigate(`/student/activities/${activity.id}`)}
                                        className="btn btn-sm btn-primary"
                                        style={{ width: '100%' }}
                                    >
                                        <FaEye /> View Activity
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
