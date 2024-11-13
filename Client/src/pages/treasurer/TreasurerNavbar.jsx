// src//pages/treasurer/TreasurerNavbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const TreasurerNavbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();

        try {
            console.log('1. Starting logout process');
            const userDetailsString = localStorage.getItem('userDetails');
            console.log('2. UserDetails from storage:', userDetailsString);

            if (!userDetailsString) {
                console.log('3a. No user details found - redirecting');
                localStorage.clear();
                navigate('/sbo-fee-collection', { replace: true });
                return;
            }

            const userDetails = JSON.parse(userDetailsString);
            console.log('3b. Parsed user details:', userDetails);

            const response = await axios.post('http://localhost:8000/api/logout', {
                userId: userDetails._id,
                userModel: userDetails.position,
                email: userDetails.email,
                loginLogId: userDetails.loginLogId
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('5. Server response:', response.data);

            if (response.data.success) {
                localStorage.clear();
                sessionStorage.clear();
                navigate('/sbo-fee-collection', { replace: true });
            } else {
                console.error('Logout failed:', response.data.message);
                localStorage.clear();
                sessionStorage.clear();
                navigate('/sbo-fee-collection', { replace: true });
            }
        } catch (error) {
            console.error('Logout error:', error);
            if (error.response) {
                console.error('Server error response:', error.response.data);
            }
            localStorage.clear();
            sessionStorage.clear();
            navigate('/sbo-fee-collection', { replace: true });
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
                        <img src="/public/images/COT-logo.png" alt="COT Logo" style={{ width: '1.857rem', height: '1.857rem' }} />
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