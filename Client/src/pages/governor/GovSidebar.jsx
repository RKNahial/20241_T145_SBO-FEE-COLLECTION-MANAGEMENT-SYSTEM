// src//pages/admin/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const GovSidebar = ({ isCollapsed }) => {
    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div className="nav" style={{ marginTop: '-0.55rem' }}>
                        <div>
                            <NavLink className={({ isActive }) => `nav-link mt-4 ${isActive ? 'active' : ''}`} to="/governor/dashboard" end>
                                <i className="fas fa-home icon-space"></i>{!isCollapsed && <span> Dashboard</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/governor/students" end>
                                <i className="far fa-user icon-space"></i>{!isCollapsed && <span> Students</span>}
                            </NavLink>
                            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/governor/officers" end>
                                <i className="fa fa-users icon-space"></i>{!isCollapsed && <span> Officers</span>}
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

export default GovSidebar;