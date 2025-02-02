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
    const [showExitModal, setShowExitModal] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

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

        const acquireLock = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // Add retries for lock acquisition
                let retryCount = 0;
                const maxRetries = 3;
                let lastError = null;

                while (retryCount < maxRetries) {
                    try {
                        const response = await axios.post(
                            `http://localhost:8000/api/students/${id}/acquire-lock/Edit`,
                            {},
                            {
                                headers: { 
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (!mounted) return;

                        if (response.data.success) {
                            setIsLocked(true);
                            return;
                        } else {
                            lastError = response.data.message;
                        }
                    } catch (error) {
                        lastError = error.response?.data?.message || 'Unable to acquire lock';
                        if (error.response?.status === 401) {
                            // Handle unauthorized
                            localStorage.removeItem('token');
                            navigate('/login');
                            return;
                        } else if (error.response?.status === 404) {
                            // Handle student not found
                            setError('Student record not found');
                            setTimeout(() => navigate('/treasurer/students'), 3000);
                            return;
                        } else if (error.response?.status !== 409) {
                            // If it's not a conflict error, throw it immediately
                            throw error;
                        }
                    }

                    retryCount++;
                    if (retryCount < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
                    }
                }

                // If we get here, we've exhausted our retries
                setError(lastError || 'Unable to acquire lock after multiple attempts');
                setTimeout(() => {
                    navigate('/treasurer/students');
                }, 3000);
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
                        case 409:
                            errorMessage = error.response.data.message || 'This student is currently being edited by another user.';
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
                    errorMessage = 'No response from server. Please check your connection.';
                } else {
                    errorMessage = 'Error setting up the request. Please try again.';
                }

                setError(errorMessage);
                setTimeout(() => {
                    navigate('/treasurer/students');
                }, 3000);
            }
        };

        // Handle browser back button
        const handlePopState = (e) => {
            if (isLocked) {
                e.preventDefault();
                setShowExitModal(true);
            }
        };

        window.addEventListener('popstate', handlePopState);
        acquireLock();

        return () => {
            mounted = false;
            window.removeEventListener('popstate', handlePopState);
            // Release lock if component unmounts while locked
            if (isLocked) {
                releaseLock();
            }
        };
    }, [id, navigate, isLocked]);

    useEffect(() => {
        return () => {
            // Call release lock when the component unmounts
            if (isLocked) {
                releaseLock();
            }
        };
    }, [isLocked]);

    const releaseLock = async () => {
        try {
            if (!isLocked) return;
            
            const token = localStorage.getItem('token');
            if (!token) return;

            await axios.delete(
                `http://localhost:8000/api/students/${id}/release-lock/Edit`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setIsLocked(false);
        } catch (error) {
            console.error('Error releasing lock:', error);
        }
    };

    // Function to handle navigation away
    const handleNavigateAway = async (path) => {
        try {
            await releaseLock();
            navigate(path);
        } catch (error) {
            console.error('Error during navigation:', error);
            // Navigate anyway to prevent user from being stuck
            navigate(path);
        }
    };

    // Set initial form data when component mounts
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                if (studentData) {
                    setFormData({
                        studentId: studentData.studentId || '',
                        name: studentData.name || '',
                        institutionalEmail: studentData.institutionalEmail || '',
                        yearLevel: studentData.yearLevel || '',
                        program: studentData.program || ''
                    });
                    return;
                }

                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `http://localhost:8000/api/update/students/${id}`,
                    { 
                        headers: { 
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        } 
                    }
                );

                if (response.data.success) {
                    const apiStudentData = response.data.data;
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
    }, []);

    const handleExit = () => {
        setShowExitModal(true);
    };

    const handleConfirmExit = () => {
        setShowExitModal(false);
        navigate('/treasurer/students');
    };

    const handleCancelExit = () => {
        setShowExitModal(false);
    };

    const clearError = () => {
        setTimeout(() => {
            setError(null);
        }, 3000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (userPermissions.updateStudent !== 'edit') {
            setError('You do not have permission to edit students');
            return;
        }

        try {
            if (!formData.studentId || !formData.name || !formData.yearLevel ||
                !formData.program || !formData.institutionalEmail) {
                setError('All fields are required');
                clearError();
                return;
            }

            if (!formData.institutionalEmail.endsWith('@student.buksu.edu.ph')) {
                setError('Email must be a valid BukSU student email');
                clearError();
                return;
            }

            setShowModal(true);
        } catch (err) {
            setError(err.message || 'Failed to update student. Please try again.');
            clearError();
        }
    };

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
                // Release the lock after successful update
                try {
                    await axios.delete(
                        `http://localhost:8000/api/students/${id}/release-lock/Edit`,
                        {
                            headers: { 
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    setIsLocked(false);
                } catch (lockError) {
                    console.error('Error releasing lock:', lockError);
                }

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
            if (err.response?.status === 500 && err.response?.data?.error?.code === 11000) {
                setError('Duplicate email cannot be updated. Try another email.');
            } else {
                setError(err.message || 'Failed to update student. Please try again.');
            }
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
                <TreasurerSidebar 
                    isCollapsed={isCollapsed} 
                    onNavigate={handleNavigateAway}
                    isEditingStudent={true}
                />
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
                                                <label className="mb-1">Year Level</label>
                                                <select
                                                    name="yearLevel"
                                                    value={formData.yearLevel}
                                                    onChange={handleChange}
                                                    className="form-select"
                                                    required
                                                >
                                                    <option value="">Select Year Level</option>
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                    <option value="4th Year">4th Year</option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Program</label>
                                                <input
                                                    type="text"
                                                    name="program"
                                                    value={formData.program}
                                                    onChange={handleChange}
                                                    className="form-control"
                                                    placeholder="Enter program"
                                                    required
                                                />
                                            </div>
                                            <div className="d-grid mt-4">
                                                <button
                                                    type="submit"
                                                    className="btn system-button update-button d-flex align-items-center"
                                                    disabled={!userPermissions.updateStudent === 'edit'}
                                                > 
                                                    <i className="fas fa-pen me-2"></i>Update   
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
                    Are you sure you want to update <strong>{formData.name}</strong>?
                </p>
                <div className="mt-3" style={{ fontSize: '0.95rem' }}>
                    <p className="mb-1">Student Information:</p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li><strong>Student ID:</strong> {formData.studentId}</li>
                        <li><strong>Program:</strong> {formData.program}</li>
                        <li><strong>Year Level:</strong> {formData.yearLevel}</li>
                        <li><strong>Email:</strong> {formData.institutionalEmail}</li>
                    </ul>
                </div>
                <small style={{ color: '#6c757d', fontSize: '0.90rem' }}>
                    Please review the details carefully before confirming.
                </small>
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

export default TreasurerEditStud;