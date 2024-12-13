// src//pages/admin/AdminSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isCollapsed }) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleLogout = async () => {
        try {
            const userDetailsString = localStorage.getItem('userDetails');
            if (userDetailsString) {
                const userDetails = JSON.parse(userDetailsString);
                await axios.post('http://localhost:8000/api/logout', {
                    userId: userDetails._id,
                    userModel: userDetails.position,
                    email: userDetails.email,
                    loginLogId: userDetails.loginLogId
                });
            }
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);
            window.location.href = '/sbo-fee-collection';
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);
            window.location.href = '/sbo-fee-collection';
        }
    };

    const handleManageControls = () => {
        navigate('/admin/manage-controls');
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div className="nav" style={{ marginTop: '-0.55rem' }}>
                        <div>
                            <NavLink
                                to="/admin/dashboard"
                                className={({ isActive }) => `nav-link mt-4 ${isActive ? 'active' : ''}`}
                            >
                                <i className="fas fa-home icon-space"></i>
                                {!isCollapsed && <span> Dashboard</span>}
                            </NavLink>
                            <NavLink
                                to="/admin/students"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <i className="far fa-user icon-space"></i>
                                {!isCollapsed && <span> Students</span>}
                            </NavLink>
                            <NavLink
                                to="/admin/officers"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <i className="fa fa-users icon-space"></i>
                                {!isCollapsed && <span> Officers</span>}
                            </NavLink>
                            <NavLink
                                to="/admin/admins"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <i className="fa fa-user-cog icon-space"></i>
                                {!isCollapsed && <span> Admin</span>}
                            </NavLink>
                            <NavLink
                                to="/admin/school-year"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <i className="fa-regular fa-calendar-days icon-space"></i>
                                {!isCollapsed && <span> School Year</span>}
                            </NavLink>
                            <NavLink
                                to="/admin/manage-controls"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <i className="fas fa-user-shield icon-space"></i>
                                {!isCollapsed && <span> Manage Controls</span>}
                            </NavLink>
                            <NavLink
                                to="/admin/history-logs"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <i className="fas fa-history icon-space"></i>
                                {!isCollapsed && <span> History Logs</span>}
                            </NavLink>
                            <NavLink to="/admin/file-upload" className={`nav-link ${location.pathname === '/admin/file-upload' ? 'active' : ''}`}>
                                <i className="fas fa-file-upload icon-space"></i>{!isCollapsed && <span> File Upload</span>}
                            </NavLink>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="nav-link logout-link"
                            style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                        >
                            <i className="fas fa-sign-out-alt icon-space logout-link"></i>
                            {!isCollapsed && <span> Logout</span>}
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default AdminSidebar;