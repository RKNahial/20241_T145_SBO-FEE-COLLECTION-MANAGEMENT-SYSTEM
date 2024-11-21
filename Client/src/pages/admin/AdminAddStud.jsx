// src/pages/officer/OfficerAddStud.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminAddStud = () => {
    // State to handle form data
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        institutionalEmail: '',
        yearLevel: '',
        program: ''
    });

    // State to handle messages and modal
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => setIsCollapsed(prev => !prev);
    const navigate = useNavigate();

    // Form data change handler
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Form submission handlers
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const confirmSubmit = async () => {
        setShowModal(false);
        try {
            const token = localStorage.getItem('token');
            console.log('Current token:', token);

            if (!token) {
                console.log('No token found in localStorage');
                setMessage({
                    type: 'error',
                    text: 'No authentication token found. Please login again.'
                });
                navigate('/login');
                return;
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            console.log('Request config:', config);

            const response = await axios.post(
                'http://localhost:8000/api/add/students',
                formData,
                config
            );

            console.log('API response:', response);
            setMessage({ type: 'success', text: 'Student added successfully!' });

            setTimeout(() => {
                navigate('/admin/students');
            }, 2000);

        } catch (error) {
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });

            if (error.response?.status === 401) {
                const errorMessage = error.response?.data?.message || 'Session expired. Please login again.';
                console.log('Authentication error:', errorMessage);
                setMessage({
                    type: 'error',
                    text: errorMessage
                });
                localStorage.removeItem('token');
            } else {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Failed to add student. Please try again.'
                });
            }
        }
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Add Student</title>
            </Helmet>
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
                <div className="content-wrapper" style={{
                    marginLeft: isCollapsed ? '80px' : '240px',
                    width: `calc(100% - ${isCollapsed ? "80px" : "240px"})`,
                    transition: 'margin-left 0.3s ease-in-out',
                    padding: '20px'
                }}>
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="far fa-plus me-2"></i> <strong>Add New Student</strong>
                                    </div>
                                    <div className="card-body">
                                        {message && (
                                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
                                                {message.text}
                                            </div>
                                        )}
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Student Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter student name"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Student ID</label>
                                                <input
                                                    type="number"
                                                    name="studentId"
                                                    value={formData.studentId}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter student ID"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Institutional Email</label>
                                                <input
                                                    type="email"
                                                    name="institutionalEmail"
                                                    value={formData.institutionalEmail}
                                                    onChange={handleChange}
                                                    className="form-control"
                                                    placeholder="Enter institutional email"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Choose Year Level</label>
                                                <select
                                                    className="form-control form-select"
                                                    name="yearLevel"
                                                    value={formData.yearLevel}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="" disabled>Select a year level</option>
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                    <option value="4th Year">4th Year</option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Choose Program</label>
                                                <select
                                                    className="form-control form-select"
                                                    name="program"
                                                    value={formData.program}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="" disabled>Select a program</option>
                                                    <option value="BSIT">BSIT</option>
                                                    <option value="BSEMC">BSEMC</option>
                                                    <option value="BSET">BSET</option>
                                                    <option value="BSAT">BSAT</option>
                                                    <option value="BSFT">BSFT</option>
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

            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Add Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you want to add <strong>{formData.name}</strong>?
                </Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="btn btn-confirm"
                        onClick={confirmSubmit}
                        style={{ flex: 'none' }}
                    >
                        Confirm
                    </Button>
                    <Button
                        variant="btn btn-cancel"
                        onClick={() => setShowModal(false)}
                        style={{ marginRight: '0.5rem', flex: 'none' }}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminAddStud;