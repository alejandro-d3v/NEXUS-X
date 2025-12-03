import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome,
    FaGraduationCap,
    FaTicketAlt,
    FaUsers,
    FaClipboardList,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';

export const TeacherLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { path: '/teacher/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/teacher/grades', icon: FaGraduationCap, label: 'My Grades' },
        { path: '/teacher/activities', icon: FaClipboardList, label: 'Activities' },
        { path: '/teacher/invitations', icon: FaTicketAlt, label: 'Invitations' },
        { path: '/teacher/students', icon: FaUsers, label: 'Students' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="teacher-layout">
            {/* Sidebar */}
            <aside className={`teacher-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>{sidebarOpen ? 'NexusX Teacher' : 'NT'}</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                            <item.icon className="nav-icon" />
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        {sidebarOpen && (
                            <div className="user-details">
                                <p className="user-name">{user?.firstName} {user?.lastName}</p>
                                <p className="user-role">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    <button
                        className="logout-btn"
                        onClick={logout}
                        title="Logout"
                    >
                        <FaSignOutAlt />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`teacher-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Outlet />
            </main>
        </div>
    );
};
