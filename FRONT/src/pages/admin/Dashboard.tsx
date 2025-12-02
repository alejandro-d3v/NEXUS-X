import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { institutionService } from '../../services/institution.service';
import { gradeService } from '../../services/grade.service';
import { adminService } from '../../services/admin.service';
import { StatsCard } from '../../components/shared/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { FaBuilding, FaChalkboard, FaUsers, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        institutions: 0,
        grades: 0,
        totalUsers: 0,
        students: 0,
        teachers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [institutions, grades, users] = await Promise.all([
                    institutionService.getAll(),
                    gradeService.getAll(),
                    adminService.getAllUsersWithProfiles(),
                ]);

                setStats({
                    institutions: institutions.length,
                    grades: grades.length,
                    totalUsers: users.length,
                    students: users.filter(u => u.role === 'STUDENT').length,
                    teachers: users.filter(u => u.role === 'TEACHER').length,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                toast.error('Error loading dashboard statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back, {user?.firstName}!</p>
            </div>

            <div className="stats-grid">
                <StatsCard
                    title="Institutions"
                    value={stats.institutions}
                    icon={<FaBuilding />}
                    color="purple"
                />
                <StatsCard
                    title="Grades"
                    value={stats.grades}
                    icon={<FaChalkboard />}
                    color="blue"
                />
                <StatsCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<FaUsers />}
                    color="green"
                />
                <StatsCard
                    title="Students"
                    value={stats.students}
                    icon={<FaUserGraduate />}
                    color="orange"
                />
                <StatsCard
                    title="Teachers"
                    value={stats.teachers}
                    icon={<FaChalkboardTeacher />}
                    color="blue"
                />
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button
                        className="action-button"
                        onClick={() => navigate('/admin/institutions')}
                    >
                        <FaBuilding />
                        <span>Manage Institutions</span>
                    </button>
                    <button
                        className="action-button"
                        onClick={() => navigate('/admin/users')}
                    >
                        <FaUsers />
                        <span>Manage Users</span>
                    </button>
                    <button
                        className="action-button"
                        onClick={() => navigate('/admin/grades')}
                    >
                        <FaChalkboard />
                        <span>Manage Grades</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
