// src//pages/officer/OfficerSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const OfficerSidebar = ({ isCollapsed }) => {
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
                        </div>
                        <NavLink className={({ isActive }) => `nav-link logout-link ${isActive ? 'active' : ''}`} to="/sbofeecollection" end>
                            <i className="fas fa-sign-out-alt icon-space logout-link"></i>{!isCollapsed && <span> Logout</span>}
                        </NavLink>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default OfficerSidebar;