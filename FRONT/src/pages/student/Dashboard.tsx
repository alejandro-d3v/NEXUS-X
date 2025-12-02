import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activityService } from '../../services/activity.service';
import { Activity } from '../../types';
import { FaUser, FaGraduationCap, FaPlus, FaList, FaGlobe, FaChalkboardTeacher } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentActivities();
    }, []);

    const fetchRecentActivities = async () => {
        try {
            const activities = await activityService.getMyActivities();
            setRecentActivities(activities.slice(0, 5));
        } catch (error) {
            toast.error('Error loading activities');
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
                        <h3>My Grade</h3>
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
                                No grade assigned yet
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card" style={{ marginTop: '2rem' }}>
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                    <Link to="/generate" className="action-card">
                        <FaPlus className="action-icon" />
                        <h3>Generate Activity</h3>
                        <p>Create a new learning activity</p>
                    </Link>
                    <Link to="/my-activities" className="action-card">
                        <FaList className="action-icon" />
                        <h3>My Activities</h3>
                        <p>View your created activities</p>
                    </Link>
                    <Link to="/public-activities" className="action-card">
                        <FaGlobe className="action-icon" />
                        <h3>Public Activities</h3>
                        <p>Browse community activities</p>
                    </Link>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="section-card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>Recent Activities</h2>
                    <Link to="/my-activities" className="btn btn-primary">
                        View All
                    </Link>
                </div>

                {loading ? (
                    <p>Loading activities...</p>
                ) : recentActivities.length === 0 ? (
                    <div className="empty-state">
                        <FaChalkboardTeacher size={48} color="#ccc" />
                        <p>No activities yet</p>
                        <Link to="/generate" className="btn btn-primary">
                            Create Your First Activity
                        </Link>
                    </div>
                ) : (
                    <div className="activities-list">
                        {recentActivities.map((activity) => (
                            <Link
                                key={activity.id}
                                to={`/activity/${activity.id}`}
                                className="activity-item"
                            >
                                <div className="activity-item-header">
                                    <h4>{activity.title}</h4>
                                    <span className="badge badge-success">
                                        Activity
                                    </span>
                                </div>
                                <p className="activity-item-description">
                                    {activity.description || 'No description'}
                                </p>
                                <div className="activity-item-footer">
                                    <span className="activity-meta">
                                        Created: {new Date(activity.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
