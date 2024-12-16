// src/pages/admin/AdminSidebar.jsx
import React, { useState } from "react"; 
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';
import { Modal } from 'react-bootstrap'; 

const AdminSidebar = ({ isCollapsed }) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false); 

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

    const confirmLogout = () => {
        handleLogout(); 
        setShowLogoutModal(false); 
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
                            onClick={() => setShowLogoutModal(true)} 
                            className="nav-link logout-link"
                            style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                        >
                            <i className="fas fa-sign-out-alt icon-space logout-link"></i>
                            {!isCollapsed && <span> Logout</span>}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title>
                        Confirm Logout
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to log out?
                    </p>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={confirmLogout} 
                            style={{
                                borderRadius: '0.35rem',
                                color: '#EAEAEA',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                backgroundColor: '#FF8C00',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#E67E22'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#FF8C00'}
                        >
                            Confirm
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowLogoutModal(false)} // Close the modal on cancel
                            style={{
                                borderRadius: '0.35rem',
                                color: '#EAEAEA',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                backgroundColor: 'red',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#cc0000'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'red'}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminSidebar;