// src//pages/admin/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = ({ isCollapsed }) => {
    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div className="nav" style={{ marginTop: '-0.55rem' }}>
                        <div>
                            <NavLink className={({ isActive }) => `nav-link mt-4 ${isActive ? 'active' : ''}`} to="/admin/dashboard" end>
                                <i className="fas fa-home icon-space"></i>{!isCollapsed && <span> Dashboard</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/manage-fee" end>
                                <i className="fas fa-hand-holding-usd icon-space"></i>{!isCollapsed && <span> Manage Fee</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/students" end>
                                <i className="far fa-user icon-space"></i>{!isCollapsed && <span> Students</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/reports" end>
                                <i className="far fa-file-alt icon-space"></i>{!isCollapsed && <span> Reports</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin/daily-dues" end>
                                <i className="fas fa-coins icon-space"></i>{!isCollapsed && <span> Daily Dues</span>}
                            </NavLink>
                        </div>
                        <NavLink className={({ isActive }) => `nav-link logout-link ${isActive ? 'active' : ''}`} to="/sbo-fee-collection" end>
                            <i className="fas fa-sign-out-alt icon-space logout-link"></i>{!isCollapsed && <span> Logout</span>}
                        </NavLink>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default AdminSidebar;