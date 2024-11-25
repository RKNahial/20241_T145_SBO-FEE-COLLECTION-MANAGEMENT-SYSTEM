import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import axios from 'axios';

const TreasurerEditStud = () => {
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

    // NEW: Add state for user permissions
    const [userPermissions, setUserPermissions] = useState({
        updateStudent: 'denied'
    });

    useEffect(() => {
        let mounted = true;
        let lockTimer;

        const acquireLock = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.post(
                    `http://localhost:8000/api/students/${id}/acquire-lock/Edit`,
                    {}, // Empty body
                    {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!mounted) return;

                if (!response.data.success) {
                    // More detailed error handling
                    const errorMessage = response.data.message || 'Unable to acquire lock';
                    setError(errorMessage);
                    
                    // If lock is already held by another user, navigate away
                    if (errorMessage.includes('currently being edited')) {
                        setTimeout(() => {
                            navigate('/treasurer/students');
                        }, 2000);
                    }
                    return;
                }

                // Set timer to show warning when lock is about to expire
                lockTimer = setTimeout(() => {
                    if (mounted) {
                        setError('Your edit session will expire in 5 seconds. Please save your changes.');
                    }
                }, 55000); // Show warning 5 seconds before expiration
            } catch (error) {
                if (!mounted) return;

                console.error('Lock acquisition error:', error);
                let errorMessage = 'Unable to edit student at this time';

                if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            errorMessage = 'Your session has expired. Please log in again.';
                            localStorage.removeItem('token');
                            navigate('/login');
                            break;
                        case 404:
                            errorMessage = 'Student record not found.';
                            break;
                        case 400:
                            errorMessage = error.response.data.message || 'Invalid request. Please try again.';
                            break;
                        case 500:
                            errorMessage = 'Server error while acquiring lock. Please try again later.';
                            break;
                        default:
                            errorMessage = error.response.data.message || 'Unable to edit student at this time';
                    }
                } else if (error.request) {
                    // Request was made but no response received
                    errorMessage = 'No response from server. Please check your connection.';
                } else {
                    // Something happened in setting up the request
                    errorMessage = 'Error setting up the request. Please try again.';
                }

                setError(errorMessage);
                setTimeout(() => {
                    navigate('/treasurer/students');
                }, 2000);
            }
        };

        const releaseLock = async () => {
            if (!mounted) return;
            
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                await axios.delete(
                    `http://localhost:8000/api/students/${id}/release-lock/Edit`,
                    {
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } catch (error) {
                console.error('Error releasing lock:', error);
                // Don't show error to user since they're likely navigating away
            }
        };

        acquireLock();

        return () => {
            mounted = false;
            if (lockTimer) clearTimeout(lockTimer);
            releaseLock();
        };
    }, [id, navigate]);

    // Set initial form data when component mounts
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // First, check if student data was passed through navigation state
                if (studentData) {
                    console.log('Using student data from navigation state:', studentData);
                    setFormData({
                        studentId: studentData.studentId || '',
                        name: studentData.name || '',
                        institutionalEmail: studentData.institutionalEmail || '',
                        yearLevel: studentData.yearLevel || '',
                        program: studentData.program || ''
                    });
                    return;
                }

                // If no student data in state, fetch from API
                const token = localStorage.getItem('token');
                console.log('Fetching student data for ID:', id);
                
                const response = await axios.get(
                    `http://localhost:8000/api/update/students/${id}`,
                    { 
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        } 
                    }
                );

                console.log('API Response:', response.data);

                if (response.data.success) {
                    const apiStudentData = response.data.data;
                    console.log('Setting form data from API:', apiStudentData);
                    
                    setFormData({
                        studentId: apiStudentData.studentId || '',
                        name: apiStudentData.name || '',
                        institutionalEmail: apiStudentData.institutionalEmail || '',
                        yearLevel: apiStudentData.yearLevel || '',
                        program: apiStudentData.program || ''
                    });
                } else {
                    setError('Failed to fetch student data');
                }
            } catch (error) {
                console.error('Error fetching student data:', error);
                setError('Unable to retrieve student information');
            }
        };

        fetchStudentData();
    }, [id, studentData]);

    // NEW: Fetch user permissions
    useEffect(() => {
        const fetchUserPermissions = async () => {
            try {
                const token = localStorage.getItem('token');
                const userDetails = JSON.parse(localStorage.getItem('userDetails'));
                
                const response = await axios.get(
                    `http://localhost:8000/api/permissions/${userDetails._id}`, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data && response.data.data) {
                    const updatePermission = response.data.data.updateStudent || 'denied';
                    setUserPermissions({
                        updateStudent: updatePermission
                    });

                    // Instead of redirecting, set an error message
                    if (updatePermission !== 'edit') {
                        setError('You do not have permission to edit students');
                    }
                }
            } catch (error) {
                console.error('Error fetching user permissions:', error);
                setError('Error checking permissions. Please try again.');
            }
        };

        fetchUserPermissions();
    }, [navigate]);

   

    const clearError = () => {
        setTimeout(() => {
            setError(null);
        }, 3000);
    };

    // Modify handleSubmit to check permissions
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check if user has edit permission
        if (userPermissions.updateStudent !== 'edit') {
            setError('You do not have permission to edit students');
            return;
        }

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

            const response = await axios.put(
                `http://localhost:8000/api/update/students/${id}`,
                {
                    ...formData,
                    userName: userDetails.name || userDetails.email.split('@')[0],
                    userEmail: userDetails.email,
                    userPosition: userDetails.position,
                    userId: userDetails._id,
                    previousData: studentData
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                setSuccessMessage('Student updated successfully!');
                setShowModal(false);
                setTimeout(() => {
                    navigate('/treasurer/students', {
                        state: { updateSuccess: true }
                    });
                }, 2000);
            } else {
                throw new Error(response.data.message || 'Failed to update student');
            }
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
                <title>Treasurer | Edit Student</title>
            </Helmet>
            <TreasurerNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
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
                                                <button type="submit" className="btn system-button update-button">
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
            {/* Update Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Update Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you want to update <strong>{formData.name}</strong>?
                </Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="btn btn-confirm"
                        onClick={confirmUpdate}
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

export default TreasurerEditStud;