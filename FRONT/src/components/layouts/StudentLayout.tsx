import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome,
    FaUser,
    FaSignOutAlt,
    FaBars,
    FaTimes
} from 'react-icons/fa';

export const StudentLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { path: '/student/dashboard', label: 'Dashboard', icon: FaHome },
        { path: '/student/profile', label: 'Profile', icon: FaUser },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="student-layout">
            {/* Sidebar */}
            <aside className={`student-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>{sidebarOpen ? 'NexusX Student' : 'NS'}</h2>
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
            <main className={`student-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <Outlet />
            </main>
        </div>
    );
};
