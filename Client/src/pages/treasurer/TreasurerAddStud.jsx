import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerAddStud = () => {
    const [permissions, setPermissions] = useState({});
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        institutionalEmail: '',
        yearLevel: '',
        program: ''
    });

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const token = localStorage.getItem('token');
                const userDetails = JSON.parse(localStorage.getItem('userDetails'));
                const response = await axios.get(
                    `http://localhost:8000/api/permissions/${userDetails._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const userPermissions = response.data.data || {};
                setPermissions(userPermissions);

                // Redirect if no permission
                if ((isEditMode && userPermissions.updateStudent !== 'edit') ||
                    (!isEditMode && userPermissions.addStudent !== 'edit')) {
                    navigate('/unauthorized');
                    return;
                }
            } catch (error) {
                console.error('Error checking permissions:', error);
                navigate('/unauthorized');
            }
        };

        checkPermissions();
    }, [navigate, isEditMode]);

    // Effect to set edit mode and fetch student data
    useEffect(() => {
        // Check if there's an ID in the URL, which indicates edit mode
        if (id) {
            setIsEditMode(true);
            
            const fetchStudentData = async () => {
                try {
                    const token = localStorage.getItem('token');
                    console.log('Fetching student data for ID:', id);
                    console.log('Token:', token);

                    // Use axios for more detailed error handling
                    const response = await axios.get(
                        `http://localhost:8000/api/update/students/${id}`, 
                        { 
                            headers: { 
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            } 
                        }
                    );

                    console.log('Full response:', response);
                    
                    // Check for successful response
                    if (response.status === 200 && response.data.success) {
                        const studentData = response.data.data;
                        console.log('Received student data:', studentData);

                        // Update form data with fetched student details
                        setFormData({
                            name: studentData.name || '',
                            studentId: studentData.studentId || '',
                            institutionalEmail: studentData.institutionalEmail || '',
                            yearLevel: studentData.yearLevel || '',
                            program: studentData.program || ''
                        });
                    } else {
                        console.error('Failed to fetch student data:', response);
                        setMessage({
                            type: 'error',
                            text: 'Unable to retrieve student information'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching student data:', error);
                    
                    // More detailed error logging
                    if (error.response) {
                        // The request was made and the server responded with a status code
                        console.error('Error response data:', error.response.data);
                        console.error('Error response status:', error.response.status);
                        console.error('Error response headers:', error.response.headers);
                    } else if (error.request) {
                        // The request was made but no response was received
                        console.error('Error request:', error.request);
                    } else {
                        // Something happened in setting up the request
                        console.error('Error message:', error.message);
                    }

                    setMessage({
                        type: 'error',
                        text: error.response?.data?.message || 'Failed to fetch student data'
                    });
                }
            };

            fetchStudentData();
        }
    }, [id]);

    // State to handle messages
    const [message, setMessage] = useState(null);

    // State to handle modal visibility
    const [showModal, setShowModal] = useState(false);

    // Handle sidebar collapse
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => setIsCollapsed(prev => !prev);

    // Form data change handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Updating ${name} with value:`, value);
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            console.log('New form data:', newData);
            return newData;
        });
    };

    // Form submission handler
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true); 
    };

    const confirmSubmit = async () => {
        setShowModal(false);
        try {
            const token = localStorage.getItem('token');
            const userDetailsStr = localStorage.getItem('userDetails');

            if (!userDetailsStr) {
                setMessage({
                    type: 'error',
                    text: 'Session expired. Please login again.'
                });
                return;
            }

            // Validate form data
            if (!formData.name || !formData.studentId || !formData.institutionalEmail || !formData.yearLevel || !formData.program) {
                setMessage({
                    type: 'error',
                    text: 'All fields are required'
                });
                return;
            }

            const userDetails = JSON.parse(userDetailsStr);
            console.log('Submitting form data:', formData);
            console.log('User details:', userDetails);

            const endpoint = isEditMode
                ? `http://localhost:8000/api/update/students/${id}`
                : 'http://localhost:8000/api/add/students';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await axios({
                method,
                url: endpoint,
                data: {
                    ...formData,
                    userName: userDetails.name || userDetails.email.split('@')[0],
                    userEmail: userDetails.email,
                    userPosition: userDetails.position,
                    userId: userDetails._id
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Server response:', response.data);

            setMessage({
                type: 'success',
                text: isEditMode ? 'Student updated successfully!' : 'Student added successfully!'
            });

            setTimeout(() => {
                navigate('/treasurer/students');
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            if (error.response?.status === 500 && error.response?.data?.error?.code === 11000) {
                setMessage({
                    type: 'error',
                    text: 'Duplicate email cannot be Add. Try another email.'
                });
            } else {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} student`
                });
            }
        }
    };


    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | {isEditMode ? 'Edit' : 'Add'} Student</title>
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
                                        <i className={`far fa-${isEditMode ? 'edit' : 'plus'} me-2`}></i>
                                        <strong>{isEditMode ? 'Edit Student' : 'Add New Student'}</strong>
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
                                                    type="text"
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
                                                    <i className={`far fa-${isEditMode ? 'edit' : 'plus'} me-1`}></i>
                                                    {isEditMode ? 'Update' : 'Add'}
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
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title>
                        Confirm Add Student
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to add <strong>{formData.name}</strong>?
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
        </div >
    );
};

export default TreasurerAddStud;