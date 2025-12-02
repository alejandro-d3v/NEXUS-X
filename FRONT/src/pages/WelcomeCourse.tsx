import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaGraduationCap, FaBuilding, FaChalkboardTeacher, FaIdCard, FaCalendar } from 'react-icons/fa';

export const WelcomeCourse: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const enrollmentData = location.state?.enrollmentData;

    useEffect(() => {
        // If no enrollment data, redirect to dashboard
        if (!enrollmentData) {
            navigate('/student/dashboard');
        }
    }, [enrollmentData, navigate]);

    if (!enrollmentData) {
        return null;
    }

    const { grade, institution, studentProfile } = enrollmentData;

    return (
        <div className="welcome-page">
            <div className="welcome-container">
                {/* Success Icon */}
                <div className="welcome-icon">
                    <FaCheckCircle />
                </div>

                {/* Welcome Message */}
                <h1>Welcome to {grade.name}! 🎉</h1>
                <p className="welcome-subtitle">
                    You've been successfully enrolled in the course
                </p>

                {/* Course Details Card */}
                <div className="welcome-card">
                    <h2>Course Information</h2>

                    <div className="welcome-info-grid">
                        <div className="welcome-info-item">
                            <div className="info-icon">
                                <FaGraduationCap />
                            </div>
                            <div className="info-content">
                                <label>Grade</label>
                                <p>{grade.name}</p>
                            </div>
                        </div>

                        {grade.subject && (
                            <div className="welcome-info-item">
                                <div className="info-icon">
                                    <FaGraduationCap />
                                </div>
                                <div className="info-content">
                                    <label>Subject</label>
                                    <p>{grade.subject}</p>
                                </div>
                            </div>
                        )}

                        {grade.level && (
                            <div className="welcome-info-item">
                                <div className="info-icon">
                                    <FaGraduationCap />
                                </div>
                                <div className="info-content">
                                    <label>Level</label>
                                    <p>{grade.level}</p>
                                </div>
                            </div>
                        )}

                        <div className="welcome-info-item">
                            <div className="info-icon">
                                <FaBuilding />
                            </div>
                            <div className="info-content">
                                <label>Institution</label>
                                <p>{institution.name}</p>
                            </div>
                        </div>

                        {grade.teacher && (
                            <div className="welcome-info-item">
                                <div className="info-icon">
                                    <FaChalkboardTeacher />
                                </div>
                                <div className="info-content">
                                    <label>Teacher</label>
                                    <p>
                                        {grade.teacher.user?.firstName} {grade.teacher.user?.lastName}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="welcome-info-item">
                            <div className="info-icon">
                                <FaIdCard />
                            </div>
                            <div className="info-content">
                                <label>Your Student ID</label>
                                <p>{studentProfile.studentId}</p>
                            </div>
                        </div>

                        <div className="welcome-info-item">
                            <div className="info-icon">
                                <FaCalendar />
                            </div>
                            <div className="info-content">
                                <label>Enrollment Date</label>
                                <p>{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="welcome-actions">
                    <Link to="/student/dashboard" className="btn btn-primary btn-large">
                        Go to Dashboard
                    </Link>
                    <Link to="/generate" className="btn btn-secondary">
                        Generate Your First Activity
                    </Link>
                </div>

                {/* Additional Info */}
                <div className="welcome-footer">
                    <p>
                        You can now access all course materials and start creating activities.
                        Check your dashboard for more information.
                    </p>
                </div>
            </div>
        </div>
    );
};
