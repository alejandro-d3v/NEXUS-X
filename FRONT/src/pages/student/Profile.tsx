import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaIdCard, FaCoins, FaGraduationCap, FaBuilding, FaChalkboardTeacher, FaCalendar } from 'react-icons/fa';

export const StudentProfile: React.FC = () => {
    const { user } = useAuth();
    const studentProfile = user?.studentProfile;
    const grade = studentProfile?.grade;
    const institution = studentProfile?.institution;
    const teacher = grade?.teacher;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>My Profile</h1>
            </div>

            {/* Personal Information */}
            <div className="section-card">
                <div className="section-header">
                    <FaUser className="section-icon" style={{ color: '#10b981' }} />
                    <h2>Personal Information</h2>
                </div>
                <div className="profile-grid">
                    <div className="profile-item">
                        <div className="profile-item-icon">
                            <FaUser />
                        </div>
                        <div className="profile-item-content">
                            <label>Full Name</label>
                            <p>{user?.firstName} {user?.lastName}</p>
                        </div>
                    </div>

                    <div className="profile-item">
                        <div className="profile-item-icon">
                            <FaEnvelope />
                        </div>
                        <div className="profile-item-content">
                            <label>Email</label>
                            <p>{user?.email}</p>
                        </div>
                    </div>

                    <div className="profile-item">
                        <div className="profile-item-icon">
                            <FaIdCard />
                        </div>
                        <div className="profile-item-content">
                            <label>Student ID</label>
                            <p>{studentProfile?.studentId || 'Not assigned'}</p>
                        </div>
                    </div>

                    <div className="profile-item">
                        <div className="profile-item-icon">
                            <FaCoins />
                        </div>
                        <div className="profile-item-content">
                            <label>Available Credits</label>
                            <p>{user?.credits || 0}</p>
                        </div>
                    </div>

                    <div className="profile-item">
                        <div className="profile-item-icon">
                            <FaCalendar />
                        </div>
                        <div className="profile-item-content">
                            <label>Account Created</label>
                            <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="profile-item">
                        <div className="profile-item-icon">
                            <FaUser />
                        </div>
                        <div className="profile-item-content">
                            <label>Account Status</label>
                            <p>
                                <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                                    {user?.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enrollment Information */}
            <div className="section-card" style={{ marginTop: '2rem' }}>
                <div className="section-header">
                    <FaGraduationCap className="section-icon" style={{ color: '#3b82f6' }} />
                    <h2>Enrollment Information</h2>
                </div>

                {grade ? (
                    <div className="profile-grid">
                        <div className="profile-item">
                            <div className="profile-item-icon">
                                <FaGraduationCap />
                            </div>
                            <div className="profile-item-content">
                                <label>Grade</label>
                                <p>{grade.name}</p>
                            </div>
                        </div>

                        <div className="profile-item">
                            <div className="profile-item-icon">
                                <FaBuilding />
                            </div>
                            <div className="profile-item-content">
                                <label>Institution</label>
                                <p>{institution?.name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="profile-item">
                            <div className="profile-item-icon">
                                <FaGraduationCap />
                            </div>
                            <div className="profile-item-content">
                                <label>Subject</label>
                                <p>{grade.subject || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="profile-item">
                            <div className="profile-item-icon">
                                <FaGraduationCap />
                            </div>
                            <div className="profile-item-content">
                                <label>Level</label>
                                <p>{grade.level || 'N/A'}</p>
                            </div>
                        </div>

                        {teacher && (
                            <div className="profile-item">
                                <div className="profile-item-icon">
                                    <FaChalkboardTeacher />
                                </div>
                                <div className="profile-item-content">
                                    <label>Teacher</label>
                                    <p>{teacher.user?.firstName} {teacher.user?.lastName}</p>
                                </div>
                            </div>
                        )}

                        <div className="profile-item">
                            <div className="profile-item-icon">
                                <FaCalendar />
                            </div>
                            <div className="profile-item-content">
                                <label>Enrollment Date</label>
                                <p>
                                    {studentProfile?.enrollmentDate
                                        ? new Date(studentProfile.enrollmentDate).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <FaGraduationCap size={48} color="#ccc" />
                        <p>Not enrolled in any grade yet</p>
                        <p style={{ fontSize: '0.9rem', color: '#999' }}>
                            Contact your teacher or administrator for enrollment
                        </p>
                    </div>
                )}
            </div>

            {/* Additional Information */}
            {studentProfile?.notes && (
                <div className="section-card" style={{ marginTop: '2rem' }}>
                    <div className="section-header">
                        <h2>Additional Notes</h2>
                    </div>
                    <p style={{ color: '#666', lineHeight: '1.6' }}>{studentProfile.notes}</p>
                </div>
            )}
        </div>
    );
};
