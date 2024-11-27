// src/pages/governor/GovSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';

const GovSidebar = ({ isCollapsed }) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();

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

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div className="nav" style={{ marginTop: '-0.55rem' }}>
                        <div>
                            <NavLink 
                                className={({ isActive }) => `nav-link mt-4 ${isActive ? 'active' : ''}`} 
                                to="/governor/dashboard"
                            >
                                <i className="fas fa-chart-line icon-space"></i>
                                {!isCollapsed && <span> Dashboard</span>}
                            </NavLink>
                            <NavLink 
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
                                to="/governor/officers"
                            >
                                <i className="fas fa-users icon-space"></i>
                                {!isCollapsed && <span> Officers</span>}
                            </NavLink>
                            <NavLink 
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
                                to="/governor/students"
                            >
                                <i className="fas fa-user-graduate icon-space"></i>
                                {!isCollapsed && <span> Students</span>}
                            </NavLink>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="nav-link logout-link"
                            style={{ 
                                border: 'none', 
                                background: 'none', 
                                width: '100%', 
                                textAlign: 'left',
                                marginTop: 'auto'
                            }}
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

export default GovSidebar;