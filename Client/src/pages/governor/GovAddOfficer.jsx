// src/pages/Gov/GovAddOfficer.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GovSidebar from "./GovSidebar";
import GovNavbar from "./GovNavbar";
import axios from 'axios';
import { Modal } from 'react-bootstrap';

const GovAddOfficer = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        ID: '',
        email: '',
        position: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const confirmSubmit = async () => {
        setShowModal(false);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/users/register',
                { ...formData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.temporaryPassword) {
                setSuccess(`Officer added successfully!\nTemporary Password: ${response.data.temporaryPassword}`);
            } else {
                setErrorMessage('No temporary password received from server');
                setShowErrorModal(true);
                return;
            }

            setTimeout(() => {
                navigate('/governor/officers');
            }, 10000);
        } catch (error) {
            console.error('Error adding officer:', error);

            // Handle specific error cases
            let friendlyErrorMessage = 'Failed to add officer';

            if (error.response?.data?.message) {
                if (error.response.data.message.includes('duplicate key') ||
                    error.response.data.message.includes('already exists')) {

                    // Check which field is duplicate
                    if (error.response.data.message.includes('ID')) {
                        friendlyErrorMessage = `Officer ID "${formData.ID}" is already registered in the system.`;
                    } else if (error.response.data.message.includes('email')) {
                        friendlyErrorMessage = `Email "${formData.email}" is already registered in the system.`;
                    } else {
                        friendlyErrorMessage = 'This officer record already exists in the system.';
                    }
                } else {
                    friendlyErrorMessage = error.response.data.message;
                }
            }

            setErrorMessage(friendlyErrorMessage);
            setShowErrorModal(true);
        }
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | Add Officer</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
            <GovNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <GovSidebar isCollapsed={isCollapsed} />
                <div
                    id="layoutSidenav_content"
                    style={{
                        marginLeft: isCollapsed ? '5rem' : '15.625rem',
                        transition: 'margin-left 0.3s',
                        flexGrow: 1,
                        marginTop: '3.5rem'
                    }}
                >
                    {/* CONTENT */}
                    <div className="container-fluid px-4 mb-5 form-top">
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && (
                            <div className="alert alert-success">
                                <div className="mb-2" style={{ whiteSpace: 'pre-line' }}>{success}</div>
                                <div className="mt-2 small text-muted">
                                    Please save this password. It will only be shown once.
                                    <br />
                                    Page will redirect in 10 seconds...
                                </div>
                            </div>
                        )}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="far fa-plus me-2"></i> <strong>Add New Officer</strong>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Officer Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter officer name"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Officer ID</label>
                                                <input
                                                    type="text"
                                                    name="ID"
                                                    value={formData.ID}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter officer ID"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Institutional Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="form-control"
                                                    placeholder="Enter institutional email"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Choose Position</label>
                                                <select
                                                    className="form-control form-select"
                                                    name="position"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="" disabled>Select a position</option>
                                                    <option value="officer">Officer</option>
                                                    <option value="governor">Governor</option>
                                                    <option value="treasurer">Treasurer</option>
                                                </select>
                                            </div>
                                            <div className="mb-0">
                                                <button type="submit" className="btn system-button">
                                                    <i className="far fa-plus me-1"></i> Add
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Add Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title>
                        Confirm Add Officer
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to add <strong>{formData.name}</strong> as a new officer?
                    </p>
                    <div className="mt-3" style={{ fontSize: '0.95rem' }}>
                        <p className="mb-1">Officer Information:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><strong>Officer ID:</strong> {formData.ID}</li>
                            <li><strong>Position:</strong> {formData.position}</li>
                            <li><strong>Email:</strong> {formData.email}</li>
                        </ul>
                    </div>
                    <small style={{ color: '#6c757d', fontSize: '0.90rem' }}>
                        A temporary password will be generated upon confirmation.
                    </small>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={confirmSubmit}
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
                            onClick={() => setShowModal(false)}
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

            {/* Error Modal */}
            <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title style={{ color: '#dc3545' }}>
                        <i className="fas fa-exclamation-circle me-2"></i>
                        Error
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <div style={{ fontSize: '3rem', color: '#dc3545' }}>
                            <i className="fas fa-times-circle"></i>
                        </div>
                    </div>
                    <p className="mb-1 text-center">
                        {errorMessage}
                    </p>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', padding: '1rem', justifyContent: 'center' }}>
                    <button
                        type="button"
                        onClick={() => setShowErrorModal(false)}
                        style={{
                            borderRadius: '0.35rem',
                            color: '#EAEAEA',
                            border: 'none',
                            padding: '0.5rem 1.5rem',
                            transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                            backgroundColor: '#6c757d',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#5a6268'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#6c757d'}
                    >
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GovAddOfficer;