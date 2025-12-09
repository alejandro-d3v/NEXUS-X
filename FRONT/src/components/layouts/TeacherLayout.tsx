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
    FaTimes,
    FaChevronDown,
    FaChevronRight,
    FaCoins
} from 'react-icons/fa';
import { ActivityType } from '../../types';

export const TeacherLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activitiesOpen, setActivitiesOpen] = useState(false);

    const menuItems = [
        { path: '/teacher/dashboard', icon: FaHome, label: 'Dashboard' },
        { path: '/teacher/grades', icon: FaGraduationCap, label: 'My Grades' },
        { 
            path: '/teacher/activities', 
            icon: FaClipboardList, 
            label: 'Activities',
            hasSubmenu: true,
            submenu: [
                { path: '/teacher/activities', label: 'My Activities' },
                { path: '/teacher/public-activities', label: 'Public Activities' },
                { path: `/teacher/generate-activity?type=${ActivityType.EXAM}`, label: 'Generate Exam' },
                { path: `/teacher/generate-activity?type=${ActivityType.SUMMARY}`, label: 'Generate Summary' },
                { path: `/teacher/generate-activity?type=${ActivityType.LESSON_PLAN}`, label: 'Generate Lesson Plan' },
                { path: `/teacher/generate-activity?type=${ActivityType.QUIZ}`, label: 'Generate Quiz' },
                { path: `/teacher/generate-activity?type=${ActivityType.FLASHCARDS}`, label: 'Generate Flashcards' },
                { path: `/teacher/generate-activity?type=${ActivityType.ESSAY}`, label: 'Generate Essay' },
                { path: `/teacher/generate-activity?type=${ActivityType.WORKSHEET}`, label: 'Generate Worksheet' },
                { path: `/teacher/generate-activity?type=${ActivityType.PROJECT}`, label: 'Generate Project' },
                { path: `/teacher/generate-activity?type=${ActivityType.RUBRIC}`, label: 'Generate Rubric' },
            ]
        },
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
                        <div key={item.path}>
                            {item.hasSubmenu ? (
                                <>
                                    <button
                                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                        onClick={() => setActivitiesOpen(!activitiesOpen)}
                                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        <item.icon className="nav-icon" />
                                        {sidebarOpen && (
                                            <>
                                                <span className="nav-label">{item.label}</span>
                                                {activitiesOpen ? <FaChevronDown style={{ marginLeft: 'auto' }} /> : <FaChevronRight style={{ marginLeft: 'auto' }} />}
                                            </>
                                        )}
                                    </button>
                                    {activitiesOpen && sidebarOpen && (
                                        <div className="submenu">
                                            {item.submenu?.map((subitem) => (
                                                <Link
                                                    key={subitem.path}
                                                    to={subitem.path}
                                                    className={`nav-item submenu-item ${isActive(subitem.path) ? 'active' : ''}`}
                                                >
                                                    <span className="nav-label">{subitem.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                >
                                    <item.icon className="nav-icon" />
                                    {sidebarOpen && <span className="nav-label">{item.label}</span>}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="credits-display">
                        <FaCoins className="credits-icon" />
                        {sidebarOpen && <span className="credits-label">Credits: {user?.credits || 0}</span>}
                        {!sidebarOpen && <span className="credits-compact">{user?.credits || 0}</span>}
                    </div>
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
