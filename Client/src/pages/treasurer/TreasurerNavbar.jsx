// src//pages/treasurer/TreasurerNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { Modal, Button } from 'react-bootstrap';

const TreasurerNavbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [userImage, setUserImage] = useState("/public/images/COT-Logo.png");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        try {
            const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
            console.log('UserDetails in navbar:', userDetails);

            const profileImage =
                userDetails.picture ||
                userDetails.imageUrl ||
                userDetails.image ||
                (userDetails.google && userDetails.google.picture);

            if (profileImage) {
                console.log('Found profile image:', profileImage);
                setUserImage(profileImage);
            }
        } catch (error) {
            console.error('Error loading user image:', error);
        }
    }, []);

    const handleLogout = async () => {
        if (handleLogout.isLoggingOut) return;
        handleLogout.isLoggingOut = true;

        try {
            const userDetailsString = localStorage.getItem('userDetails');
            const token = localStorage.getItem('token');

            if (userDetailsString) {
                const userDetails = JSON.parse(userDetailsString);

                // Call backend logout with proper authorization
                await axios.post('http://localhost:8000/api/logout', {
                    userId: userDetails._id,
                    loginLogId: userDetails.loginLogId
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Sign out from Firebase if using it
            if (auth.currentUser) {
                await signOut(auth);
            }

            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);

            // Navigate to login page
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear storage and redirect even if logout request fails
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);
            navigate('/login');
        } finally {
            handleLogout.isLoggingOut = false;
        }
    };

    const confirmLogout = () => {
        handleLogout(); 
        setShowLogoutModal(false); 
    };

    return (
        <nav className="sb-topnav navbar navbar-expand navbar navbar-padding">
            <button
                className="btn btn-link btn-sm me-2"
                id="sidebarToggle"
                onClick={toggleSidebar}
                style={{ padding: '0.5rem', marginLeft: '1.50rem', display: 'flex', alignItems: 'center' }}
            >
                <i className="fas fa-bars orange-burger"></i>
            </button>
            <Link className="navbar-brand ps-3 fw-bold" to="/treasurer/dashboard">
                SBO FEE COLLECTION SYSTEM
            </Link>
            <ul className="navbar-nav ms-auto">
                <li className="nav-item dropdown">
                    <Link
                        className="nav-link dropdown-toggle"
                        id="navbarDropdown"
                        to="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <img
                            src={userImage}
                            alt="User Profile"
                            style={{
                                width: '1.857rem',
                                height: '1.857rem',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                        <span style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}> Treasurer</span>
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><Link className="dropdown-item" to="/treasurer/profile">Profile</Link></li>
                        <li>
                            <button className="dropdown-item" onClick={() => setShowLogoutModal(true)}>Logout</button>
                        </li>
                    </ul>
                </li>
            </ul>

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
        </nav>
    );
};

export default TreasurerNavbar;