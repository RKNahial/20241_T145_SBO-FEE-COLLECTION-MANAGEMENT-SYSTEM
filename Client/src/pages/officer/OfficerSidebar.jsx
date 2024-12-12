// src//pages/officer/OfficerSidebar.jsx
import { Helmet } from 'react-helmet';
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

const OfficerSidebar = ({ isCollapsed }) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleLogout = () => {
        // Clear all localStorage items
        localStorage.removeItem('token');
        localStorage.removeItem('userDetails');

        // Clear auth context
        setUser(null);

        // Navigate to login page
        navigate('/sbo-fee-collection');
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div className="nav" style={{ marginTop: '-0.55rem' }}>
                        <div>
                            <NavLink className={({ isActive }) => `nav-link mt-4 ${isActive ? 'active' : ''}`} to="/officer/dashboard" end>
                                <i className="fas fa-home icon-space"></i>{!isCollapsed && <span> Dashboard</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/officer/review-fee" end>
                                <i className="fas fa-hand-holding-usd icon-space"></i>{!isCollapsed && <span> Review Fee</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/officer/students" end>
                                <i className="far fa-user icon-space"></i>{!isCollapsed && <span> Students</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/officer/reports" end>
                                <i className="far fa-file-alt icon-space"></i>{!isCollapsed && <span> Reports</span>}
                            </NavLink>
                             <NavLink to="/officer/file-upload" className={`nav-link ${location.pathname === '/officer/file-upload' ? 'active' : ''}`}>
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

export default OfficerSidebar;