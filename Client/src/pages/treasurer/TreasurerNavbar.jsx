// src//pages/treasurer/TreasurerNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const TreasurerNavbar = ({ toggleSidebar }) => {
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
                        <img src="/public/images/COT-logo.png" alt="COT Logo"style={{ width: '1.857rem', height: '1.857rem'}} />
                        <span style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}> Treasurer</span>
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><Link className="dropdown-item" to="/treasurer/profile">Profile</Link></li>
                        <li><Link className="dropdown-item" to="/sbofeecollection">Logout</Link></li>
                    </ul>
                </li>
            </ul>
        </nav>
    );
};

export default TreasurerNavbar;