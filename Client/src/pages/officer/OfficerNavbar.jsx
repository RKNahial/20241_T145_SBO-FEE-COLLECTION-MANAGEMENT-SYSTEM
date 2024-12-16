import { Helmet } from 'react-helmet';
import React, { useState } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { Modal } from 'react-bootstrap'; 

const OfficerNavbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false); 

    const handleLogout = () => {
        // Clear all localStorage items
        localStorage.removeItem('token');
        localStorage.removeItem('userDetails');

        // Clear auth context
        setUser(null);

        // Navigate to login page
        navigate('/sbo-fee-collection');
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
            <Link className="navbar-brand ps-3 fw-bold" to="/officer/dashboard">
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
                        <span style={{ paddingLeft: '0.5rem', paddingRight: '0.5rem' }}> Officer</span>
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                        <li><Link className="dropdown-item" to="/officer/profile">Profile</Link></li>
                        <li>
                            <button
                                className="dropdown-item"
                                onClick={() => setShowLogoutModal(true)} 
                            >
                                Logout
                            </button>
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
        </nav>
    );
};

export default OfficerNavbar;