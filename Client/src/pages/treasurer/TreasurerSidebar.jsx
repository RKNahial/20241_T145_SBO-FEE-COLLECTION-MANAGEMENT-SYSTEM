// src//pages/treasurer/TreasurerSidebar.jsx
import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';

const TreasurerSidebar = ({ isCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleLogout = async () => {
        if (handleLogout.isLoggingOut) return;
        handleLogout.isLoggingOut = true;

        try {
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

    const handleNavigation = async (path) => {
        // Check if we're currently in the edit student page
        const currentPath = location.pathname;
        const isEditingStudent = currentPath.includes('/treasurer/edit-student/');
        
        if (isEditingStudent) {
            try {
                // Extract student ID from the current path
                const studentId = currentPath.split('/').pop();
                const token = localStorage.getItem('token');
                const userDetailsStr = localStorage.getItem('userDetails');
                
                if (!token || !userDetailsStr) {
                    console.error('Missing authentication details');
                    navigate('/login');
                    return;
                }

                const userDetails = JSON.parse(userDetailsStr);

                // Release the lock
                const response = await axios({
                    method: 'delete',
                    url: `http://localhost:8000/api/students/${studentId}/release-lock/Edit`,
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        userId: userDetails._id
                    }
                });

                if (response.data && response.data.success) {
                    console.log('Lock released successfully');
                } else {
                    console.error('Failed to release lock:', response.data?.message);
                }
            } catch (error) {
                console.error('Error releasing lock:', error.response?.data || error.message);
            } finally {
                // Navigate regardless of lock release success
                navigate(path);
            }
        } else {
            // If not on edit page, just navigate
            navigate(path);
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