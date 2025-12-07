import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUser, FaGraduationCap, FaChalkboardTeacher, FaSpinner, FaEye, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../../services/api';

interface Grade {
    id: string;
    name: string;
    subject?: string;
    level?: string;
}

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
    grade: Grade;
    assignedAt: string;
}

interface CourseActivities {
    grade: Grade;
    activities: Activity[];
}

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courseActivities, setCourseActivities] = useState<CourseActivities[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchCourseActivities();
    }, []);

    const fetchCourseActivities = async () => {
        try {
            setLoading(true);
            const response = await api.get('/activities/student');
            const activities: Activity[] = response.data;

            // Group activities by grade
            const grouped = activities.reduce((acc, activity) => {
                const gradeId = activity.grade.id;
                if (!acc[gradeId]) {
                    acc[gradeId] = {
                        grade: activity.grade,
                        activities: [],
                    };
                }
                acc[gradeId].activities.push(activity);
                return acc;
            }, {} as Record<string, CourseActivities>);

            const groupedArray = Object.values(grouped);
            setCourseActivities(groupedArray);

            // Expand first course by default
            if (groupedArray.length > 0) {
                setExpandedCourses(new Set([groupedArray[0].grade.id]));
            }
        } catch (error: any) {
            toast.error('Error al cargar actividades');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCourse = (gradeId: string) => {
        setExpandedCourses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(gradeId)) {
                newSet.delete(gradeId);
            } else {
                newSet.add(gradeId);
            }
            return newSet;
        });
    };

    const studentProfile = user?.studentProfile;
    const institution = studentProfile?.institution;

    const totalActivities = courseActivities.reduce((sum, course) => sum + course.activities.length, 0);

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

            {/* Profile and Courses Info Cards */}
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
                            <span className="info-label">Institution:</span>
                            <span className="info-value">{institution?.name || 'N/A'}</span>
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

                {/* Courses Summary Card */}
                <div className="info-card">
                    <div className="info-card-header">
                        <FaGraduationCap className="info-card-icon" style={{ color: '#3b82f6' }} />
                        <h3>My Courses</h3>
                    </div>
                    <div className="info-card-body">
                        {studentProfile?.grades && studentProfile.grades.length > 0 ? (
                            <>
                                <div className="info-row">
                                    <span className="info-label">Enrolled Courses:</span>
                                    <span className="info-value">{studentProfile.grades.length}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Total Activities:</span>
                                    <span className="info-value">{totalActivities}</span>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    {studentProfile.grades.map((enrollment: any) => (
                                        <div key={enrollment.grade.id} className="course-badge">
                                            <span className="badge badge-blue" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                                                {enrollment.grade.name}
                                            </span>
                                            <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                                                {enrollment.grade.subject || 'No subject'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p style={{ color: '#999', textAlign: 'center', padding: '1rem' }}>
                                No courses enrolled yet. Use an invitation code to join a course.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Course Activities */}
            <div className="section-card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>📚 My Course Activities</h2>
                    {totalActivities > 0 && (
                        <span className="badge badge-blue" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                            {totalActivities} Total {totalActivities === 1 ? 'Activity' : 'Activities'}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <FaSpinner className="spinner" size={32} />
                        <p style={{ marginTop: '1rem', color: '#666' }}>Loading activities...</p>
                    </div>
                ) : courseActivities.length === 0 ? (
                    <div className="empty-state">
                        <FaChalkboardTeacher size={48} color="#ccc" />
                        <p>No courses or activities assigned yet</p>
                        <p style={{ color: '#999', fontSize: '0.9rem' }}>
                            Please contact your teacher or administrator to join a course
                        </p>
                    </div>
                ) : (
                    <div className="courses-accordion">
                        {courseActivities.map((course) => {
                            const isExpanded = expandedCourses.has(course.grade.id);
                            return (
                                <div key={course.grade.id} className="course-accordion-item">
                                    <div
                                        className="course-accordion-header"
                                        onClick={() => toggleCourse(course.grade.id)}
                                    >
                                        <div className="course-info">
                                            <h3>{course.grade.name}</h3>
                                            {course.grade.subject && (
                                                <span className="course-subject">{course.grade.subject}</span>
                                            )}
                                            {course.grade.level && (
                                                <span className="course-level">{course.grade.level}</span>
                                            )}
                                        </div>
                                        <div className="course-accordion-controls">
                                            <span className="activity-count">
                                                {course.activities.length} {course.activities.length === 1 ? 'activity' : 'activities'}
                                            </span>
                                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="course-accordion-content">
                                            <div className="activities-grid">
                                                {course.activities.map((activity) => (
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
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
