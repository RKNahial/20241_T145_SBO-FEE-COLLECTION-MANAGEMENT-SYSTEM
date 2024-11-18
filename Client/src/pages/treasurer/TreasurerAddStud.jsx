import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerAddStud = () => {
    // State to handle form data
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        institutionalEmail: '',
        yearLevel: '',
        program: ''
    });

    // State to handle messages
    const [message, setMessage] = useState(null);

    // State to handle modal visibility
    const [showModal, setShowModal] = useState(false);

    // Handle sidebar collapse
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => setIsCollapsed(prev => !prev);

    // Form data change handler
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Initialize navigate
    const navigate = useNavigate();

    // Form submission handler
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true); // Show the confirmation modal
    };
    
    const confirmSubmit = async () => {
        setShowModal(false); // Hide the modal
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
    
            // Create config object for better debugging
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
            console.log('Request config:', config); // Debug request configuration
    
            const response = await axios.post(
                'http://localhost:8000/api/add/students',
                formData,
                config
            );
    
            console.log('API response:', response);
            setMessage({ type: 'success', text: 'Student added successfully!' });
    
            setTimeout(() => {
                navigate('/treasurer/students');
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
                // Optionally clear token if it's expired
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
                <title>Treasurer | Add Student</title>
            </Helmet>
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
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
                                                <button
                                                    type="submit"
                                                    className="btn system-button"
                                                >
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
            </div >
            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Add Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you want to add {formData.name}?
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
        </div >
    );
};

export default TreasurerAddStud;