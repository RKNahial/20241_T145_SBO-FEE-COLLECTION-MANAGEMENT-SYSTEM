// src/pages/governor/GovAddStud.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import GovSidebar from "./GovSidebar";
import GovNavbar from "./GovNavbar";

const GovAddStud = () => {
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
    const [message, setMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

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

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            
            const fetchStudentData = async () => {
                try {
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

                    if (response.status === 200 && response.data.success) {
                        const studentData = response.data.data;
                        setFormData({
                            name: studentData.name || '',
                            studentId: studentData.studentId || '',
                            institutionalEmail: studentData.institutionalEmail || '',
                            yearLevel: studentData.yearLevel || '',
                            program: studentData.program || ''
                        });
                    } else {
                        setMessage({
                            type: 'error',
                            text: 'Unable to retrieve student information'
                        });
                    }
                } catch (error) {
                    console.error('Error fetching student data:', error);
                    setMessage({
                        type: 'error',
                        text: error.response?.data?.message || 'Failed to fetch student data'
                    });
                }
            };

            fetchStudentData();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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

            if (!formData.name || !formData.studentId || !formData.institutionalEmail || !formData.yearLevel || !formData.program) {
                setMessage({
                    type: 'error',
                    text: 'All fields are required'
                });
                return;
            }

            const userDetails = JSON.parse(userDetailsStr);
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

            setMessage({
                type: 'success',
                text: isEditMode ? 'Student updated successfully!' : 'Student added successfully!'
            });

            setTimeout(() => {
                navigate('/governor/students');
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} student`
            });
        }
    };

    const toggleSidebar = () => setIsCollapsed(prev => !prev);

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | {isEditMode ? 'Edit' : 'Add'} Student</title>
            </Helmet>
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
            </div>
            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm {isEditMode ? 'Edit' : 'Add'} Student</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you want to {isEditMode ? 'update' : 'add'} <strong>{formData.name}</strong>?
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

export default GovAddStud;