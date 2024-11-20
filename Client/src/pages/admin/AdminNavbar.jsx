// src//pages/admin/AdminNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '../../context/AuthContext';

const AdminNavbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [userImage, setUserImage] = useState("/public/images/COT-logo.png");

    useEffect(() => {
        try {
            const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
            const profileImage = userDetails.picture || userDetails.imageUrl || "/public/images/COT-logo.png";
            setUserImage(profileImage);
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

            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();
            setUser(null);

            // Redirect to login page
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
            <Link className="navbar-brand ps-3 fw-bold" to="/admin/dashboard">
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
                        <img src={userImage} alt="COT Logo" style={{ width: '1.857rem', height: '1.857rem' }} />
                        <span style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}> Admin</span>
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><Link className="dropdown-item" to="/admin/profile">Profile</Link></li>
                        <li><Link className="dropdown-item" to="/sbo-fee-collection" onClick={handleLogout}>Logout</Link></li>
                    </ul>
                </li>
            </ul>
        </nav>
    );
};

export default AdminNavbar;