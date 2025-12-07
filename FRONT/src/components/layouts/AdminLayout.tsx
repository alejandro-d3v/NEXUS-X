import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome,
    FaBuilding,
    FaUsers,
    FaGraduationCap,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaExclamationTriangle
} from 'react-icons/fa';

export const AdminLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { path: '/admin/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/admin/institutions', icon: FaBuilding, label: 'Institutions' },
        { path: '/admin/users', icon: FaUsers, label: 'Users' },
        { path: '/admin/grades', icon: FaGraduationCap, label: 'Grades' },
        { path: '/admin/database-reset', icon: FaExclamationTriangle, label: 'Database Reset', danger: true },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>{sidebarOpen ? 'NexusX Admin' : 'NX'}</h2>
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
                            className={`nav-item ${isActive(item.path) ? 'active' : ''} ${(item as any).danger ? 'danger' : ''}`}
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
            <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Outlet />
            </main>
        </div>
    );
};
