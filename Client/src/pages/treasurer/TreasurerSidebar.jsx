// src//pages/treasurer/TreasurerSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

const TreasurerSidebar = ({ isCollapsed }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (handleLogout.isLoggingOut) return;
        handleLogout.isLoggingOut = true;

        try {
            const userDetailsString = localStorage.getItem('userDetails');
            if (!userDetailsString) {
                console.error('No user details found in localStorage');
                localStorage.clear();
                console.log('Navigating to /sbo-fee-collection');
                window.location.href = '/sbo-fee-collection';
                return;
            }

            const userDetails = JSON.parse(userDetailsString);

            if (!userDetails._id || !userDetails.position || !userDetails.email || !userDetails.loginLogId) {
                console.error('Missing required user details');
                localStorage.clear();
                console.log('Navigating to /sbo-fee-collection');
                window.location.href = '/sbo-fee-collection';
                return;
            }

            const response = await axios.post('http://localhost:8000/api/logout', {
                userId: userDetails._id,
                userModel: userDetails.position,
                email: userDetails.email,
                loginLogId: userDetails.loginLogId
            });

            console.log('Logout response:', response.data);

            if (response.data.success) {
                localStorage.clear();
                console.log('Navigating to /sbo-fee-collection');
                window.location.href = '/sbo-fee-collection';
            } else {
                console.error('Logout failed:', response.data.message);
            }

        } catch (error) {
            console.error('Logout error:', error);
            localStorage.clear();
            console.log('Navigating to /sbo-fee-collection');
            window.location.href = '/sbo-fee-collection';
        } finally {
            handleLogout.isLoggingOut = false;
        }
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div className="nav" style={{ marginTop: '-0.55rem' }}>
                        <div>
                            <NavLink className={({ isActive }) => `nav-link mt-4 ${isActive ? 'active' : ''}`} to="/treasurer/dashboard" end>
                                <i className="fas fa-home icon-space"></i>{!isCollapsed && <span> Dashboard</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/treasurer/manage-fee" end>
                                <i className="fas fa-hand-holding-usd icon-space"></i>{!isCollapsed && <span> Manage Fee</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/treasurer/students" end>
                                <i className="far fa-user icon-space"></i>{!isCollapsed && <span> Students</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/treasurer/reports" end>
                                <i className="far fa-file-alt icon-space"></i>{!isCollapsed && <span> Reports</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/treasurer/daily-dues" end>
                                <i className="fas fa-coins icon-space"></i>{!isCollapsed && <span> Daily Dues</span>}
                            </NavLink>
                        </div>
                        <button
                            className="nav-link logout-link"
                            onClick={handleLogout}
                            style={{
                                border: 'none',
                                background: 'none',
                                width: '100%',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center'
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

export default TreasurerSidebar;