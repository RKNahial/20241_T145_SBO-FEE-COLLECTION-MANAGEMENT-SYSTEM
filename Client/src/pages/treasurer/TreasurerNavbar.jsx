// src//pages/treasurer/TreasurerNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';

const TreasurerNavbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [userImage, setUserImage] = useState("/public/images/COT-logo.png");

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

    const handleLogout = async (e) => {
        e.preventDefault();

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

            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();

            // Clear specific consent-related items
            localStorage.removeItem('token');
            localStorage.removeItem('userDetails');
            localStorage.removeItem('showLoginCelebration');
            sessionStorage.removeItem('showLoginCelebration');

            // Clear any session cookies
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

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
        }
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
                        <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                    </ul>
                </li>
            </ul>
        </nav>
    );
};

export default TreasurerNavbar;