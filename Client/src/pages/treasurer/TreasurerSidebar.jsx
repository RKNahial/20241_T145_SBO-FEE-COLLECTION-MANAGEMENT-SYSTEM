import React, { useState } from "react"; // Import useState
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { Modal, Button } from 'react-bootstrap';

const TreasurerSidebar = ({ isCollapsed, onNavigate, isEditingStudent }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false); // State for logout modal

    const handleNavigation = async (path) => {
        if (isEditingStudent && onNavigate) {
            await onNavigate(path);
        } else {
            navigate(path);
        }
    };

    const handleLogout = async () => {
        if (handleLogout.isLoggingOut) return;
        handleLogout.isLoggingOut = true;

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

            if (auth.currentUser) {
                await signOut(auth);
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
        } finally {
            handleLogout.isLoggingOut = false;
        }
    };

    const confirmLogout = () => {
        handleLogout(); // Call the logout function
        setShowLogoutModal(false); // Close the modal
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div className="nav" style={{ marginTop: '0.65rem' }}>
                        <div>
                            <div onClick={() => handleNavigation('/treasurer/dashboard')} className={`nav-link ${location.pathname === '/treasurer/dashboard' ? 'active' : ''}`} role="button">
                                <i className="fas fa-home icon-space"></i>{!isCollapsed && <span> Dashboard</span>}
                            </div> 
                            <div onClick={() => handleNavigation('/treasurer/manage-fee')} className={`nav-link ${location.pathname === '/treasurer/manage-fee' ? 'active' : ''}`} role="button">
                                <i className="fas fa-hand-holding-usd icon-space"></i>{!isCollapsed && <span> Manage Fee</span>}
                            </div>
                            <div onClick={() => handleNavigation('/treasurer/students')} className={`nav-link ${location.pathname === '/treasurer/students' ? 'active' : ''}`} role="button">
                                <i className="far fa-user icon-space"></i>{!isCollapsed && <span> Students</span>}
                            </div>
                            <div onClick={() => handleNavigation('/treasurer/reports')} className={`nav-link ${location.pathname === '/treasurer/reports' ? 'active' : ''}`} role="button">
                                <i className="far fa-file-alt icon-space"></i>{!isCollapsed && <span> Reports</span>}
                            </div>
                            <div onClick={() => handleNavigation('/treasurer/daily-dues')} className={`nav-link ${location.pathname === '/treasurer/daily-dues' ? 'active' : ''}`} role="button">
                                <i className="fas fa-coins icon-space"></i>{!isCollapsed && <span> Daily Dues</span>}
                            </div>
                            <NavLink to="/treasurer/file-upload" className={`nav-link ${location.pathname === '/treasurer/file-upload' ? 'active' : ''}`}>
                                <i className="fas fa-file-upload icon-space"></i>{!isCollapsed && <span> File Upload</span>}
                            </NavLink>
                        </div>
                        <button
                            className="nav-link logout-link"
                            onClick={() => setShowLogoutModal(true)} // Show the logout modal
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
                            onClick={() => setShowLogoutModal(false)} 
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

export default TreasurerSidebar;