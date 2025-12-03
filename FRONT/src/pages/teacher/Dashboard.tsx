import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { gradeService } from '../../services/grade.service';
import { invitationService } from '../../services/invitation.service';
import { StatsCard } from '../../components/shared/StatsCard';
import { Grade, InvitationCode } from '../../types';
import { FaGraduationCap, FaUsers, FaTicketAlt, FaPlus, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

export const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalGrades: 0,
        totalStudents: 0,
        activeInvitations: 0,
    });
    const [myGrades, setMyGrades] = useState<Grade[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [gradesData, invitationsData] = await Promise.all([
                gradeService.getMyGrades(), // Only get grades where current user is the teacher
                invitationService.getMyCodes(),
            ]);

            // Calculate total students across all my grades
            const totalStudents = gradesData.reduce(
                (sum: number, grade: Grade) => sum + (grade._count?.students || 0),
                0
            );

            // Count active invitations
            const activeInvitations = invitationsData.filter(
                (inv: InvitationCode) => inv.isActive && inv.expiresAt && new Date(inv.expiresAt) > new Date()
            ).length;

            setStats({
                totalGrades: gradesData.length,
                totalStudents,
                activeInvitations,
            });

            setMyGrades(gradesData);
        } catch (error) {
            toast.error('Error loading dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Welcome back, {user?.firstName}! 👋</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>
                        Here's an overview of your teaching activities
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <StatsCard
                    title="My Grades"
                    value={stats.totalGrades}
                    icon={<FaGraduationCap />}
                    color="blue"
                />
                <StatsCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={<FaUsers />}
                    color="green"
                />
                <StatsCard
                    title="Active Invitations"
                    value={stats.activeInvitations}
                    icon={<FaTicketAlt />}
                    color="orange"
                />
            </div>

            {/* Quick Actions */}
            <div className="section-card" style={{ marginTop: '2rem' }}>
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                    <Link to="/teacher/grades" className="action-card">
                        <FaPlus className="action-icon" />
                        <h3>Create New Grade</h3>
                        <p>Add a new class or course</p>
                    </Link>
                    <Link to="/teacher/invitations" className="action-card">
                        <FaTicketAlt className="action-icon" />
                        <h3>Generate Invitation</h3>
                        <p>Create code for students</p>
                    </Link>
                    <Link to="/teacher/students" className="action-card">
                        <FaUsers className="action-icon" />
                        <h3>View Students</h3>
                        <p>See all enrolled students</p>
                    </Link>
                </div>
            </div>

            {/* My Grades Overview */}
            <div className="section-card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>My Grades</h2>
                    <Link to="/teacher/grades" className="btn btn-primary">
                        View All
                    </Link>
                </div>

                {loading ? (
                    <p>Loading grades...</p>
                ) : myGrades.length === 0 ? (
                    <div className="empty-state">
                        <FaGraduationCap size={48} color="#ccc" />
                        <p>No grades assigned yet</p>
                        <Link to="/teacher/grades" className="btn btn-primary">
                            Create Your First Grade
                        </Link>
                    </div>
                ) : (
                    <div className="grades-grid">
                        {myGrades.slice(0, 6).map((grade) => (
                            <div key={grade.id} className="grade-card">
                                <div className="grade-card-header">
                                    <h3>{grade.name}</h3>
                                    <span className={`badge ${grade.isActive ? 'badge-success' : 'badge-danger'}`}>
                                        {grade.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="grade-subject">{grade.subject || 'No subject'}</p>
                                <p className="grade-level">Level: {grade.level || 'N/A'}</p>
                                <div className="grade-card-footer">
                                    <div className="student-count">
                                        <FaUsers />
                                        <span>{grade._count?.students || 0} students</span>
                                    </div>
                                    <Link to={`/teacher/grades`} className="btn-icon" title="View Details">
                                        <FaEye />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
