// src//pages/treasurer/TreasurerSidebar.jsx
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';

const TreasurerSidebar = ({ isCollapsed, onNavigate, isEditingStudent }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleNavigation = async (path) => {
        if (isEditingStudent && onNavigate) {
            // Use the provided navigation handler if we're editing a student
            await onNavigate(path);
        } else {
            // Regular navigation for other cases
            navigate(path);
        }
    };

    const handleLogout = async () => {
        if (handleLogout.isLoggingOut) return;
        handleLogout.isLoggingOut = true;

        try {
            // If we're editing a student, release the lock before logging out
            if (isEditingStudent && onNavigate) {
                await onNavigate('/sbo-fee-collection');
                return;
            }

            const userDetailsString = localStorage.getItem('userDetails');
            if (userDetailsString) {
                const userDetails = JSON.parse(userDetailsString);

                // Call backend logout
                await axios.post('http://localhost:8000/api/logout', {
                    userId: userDetails._id,
                    userModel: userDetails.position,
                    email: userDetails.email,
                    loginLogId: userDetails.loginLogId
                });
            }

            // Sign out from Firebase/Google
            if (auth.currentUser) {
                await signOut(auth);
            }

            // Clear all local data
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);

            // Force redirect to login
            window.location.href = '/sbo-fee-collection';
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if there's an error
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);
            window.location.href = '/sbo-fee-collection';
        } finally {
            handleLogout.isLoggingOut = false;
        }
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