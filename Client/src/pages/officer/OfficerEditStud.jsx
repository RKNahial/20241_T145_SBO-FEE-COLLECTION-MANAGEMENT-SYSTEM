import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import OfficerSidebar from "./OfficerSidebar";
import OfficerNavbar from "./OfficerNavbar";
import axios from 'axios';

const OfficerEditStud = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [showModal, setShowModal] = useState(false);

    // Get the student data passed from the previous page
    const studentData = location.state?.studentData;

    // Initialize form data with student data
    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        institutionalEmail: '',
        yearLevel: '',
        program: ''
    });

    // Set initial form data when component mounts
    useEffect(() => {
        if (studentData) {
            setFormData({
                studentId: studentData.studentId || '',
                name: studentData.name || '',
                institutionalEmail: studentData.institutionalEmail || '',
                yearLevel: studentData.yearLevel || '',
                program: studentData.program || ''
            });
        }
    }, [studentData]);

    const clearError = () => {
        setTimeout(() => {
            setError(null);
        }, 5000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            // Validate all fields
            if (!formData.studentId || !formData.name || !formData.yearLevel ||
                !formData.program || !formData.institutionalEmail) {
                setError('All fields are required');
                clearError();
                return;
            }

            // Validate email format
            if (!formData.institutionalEmail.endsWith('@student.buksu.edu.ph')) {
                setError('Email must be a valid BukSU student email');
                clearError();
                return;
            }

            // If validation passes, show modal
            setShowModal(true);
        } catch (err) {
            setError(err.message || 'Failed to update student. Please try again.');
            clearError();
        }
    };

    // Also update your confirmUpdate function
    const confirmUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const userDetailsStr = localStorage.getItem('userDetails');

            if (!userDetailsStr) {
                setError('Session expired. Please login again.');
                return;
            }

            const userDetails = JSON.parse(userDetailsStr);

            const response = await fetch(`http://localhost:8000/api/students/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    userName: userDetails.name || userDetails.email.split('@')[0],
                    userEmail: userDetails.email,
                    userPosition: userDetails.position,
                    userId: userDetails._id,
                    previousData: studentData // Include previous data for logging changes
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update student');
            }

            setSuccessMessage('Student updated successfully!');
            setShowModal(false);
            setTimeout(() => {
                navigate('/officer/students', {
                    state: { updateSuccess: true }
                });
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to update student. Please try again.');
            clearError();
            setShowModal(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Officer | Edit Student</title>
            </Helmet>
            <OfficerNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <div style={{ display: 'flex' }}>
                <OfficerSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    transition: 'margin-left 0.3s',
                    flexGrow: 1,
                    marginTop: '3.5rem'
                }}>
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="fa-solid fa-pen me-2"></i> <strong>Edit Student</strong>
                                    </div>
                                    <div className="card-body">
                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}
                                        {successMessage && (
                                            <div className="alert alert-success" role="alert">
                                                {successMessage}
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
                                                    name="yearLevel"
                                                    value={formData.yearLevel}
                                                    onChange={handleChange}
                                                    className="form-control form-select"
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
                                                    name="program"
                                                    value={formData.program}
                                                    onChange={handleChange}
                                                    className="form-control form-select"
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
                                                <button type="submit" className="btn system-button update-button d-flex align-items-center">
                                                    <i className="fa-solid fa-pen me-1"></i> Update
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
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title>
                        Confirm Update Student
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to update the information for <strong>{formData.name}</strong>?
                    </p>
                    <div className="mt-3" style={{ fontSize: '0.95rem' }}>
                        <p className="mb-1">Updated Information:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><strong>Student ID:</strong> {formData.studentId}</li>
                            <li><strong>Program:</strong> {formData.program}</li>
                        </ul>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={confirmUpdate}
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
        </div>
    );
};

export default OfficerEditStud;