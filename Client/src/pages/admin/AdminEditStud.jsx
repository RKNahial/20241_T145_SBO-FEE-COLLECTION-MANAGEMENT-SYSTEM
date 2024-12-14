// src/pages/admin/AdminEditStud.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';
import { Modal } from 'react-bootstrap';

const AdminEditStud = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState(null);
    const [studentData, setStudentData] = useState({
        name: '',
        studentId: '',
        institutionalEmail: '',
        yearLevel: '',
        program: ''
    });

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev)
    };

    // Fetch student data when component mounts
    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `http://localhost:8000/api/getAll/students/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.data && response.data.data) {
                    setStudentData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching student:', error);
                setError('Failed to fetch student data');
                setTimeout(() => {
                    navigate('/admin/students');
                }, 2000);
            }
        };

        fetchStudentData();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setShowModal(true);
        setSuccessMessage('');

        try {
            // Validate required fields
            if (!studentData.name || !studentData.studentId || !studentData.institutionalEmail || 
                !studentData.yearLevel || !studentData.program) {
                setError('All fields are required');
                return;
            }

            // Validate email format
            if (!studentData.institutionalEmail.endsWith('@student.buksu.edu.ph')) {
                setError('Institutional email must end with @student.buksu.edu.ph');
                return;
            }

            const token = localStorage.getItem('token');
            const previousData = { ...studentData };
            
            // Remove any extra fields that shouldn't be sent
            const updateData = {
                name: studentData.name,
                studentId: studentData.studentId,
                institutionalEmail: studentData.institutionalEmail,
                yearLevel: studentData.yearLevel,
                program: studentData.program,
                previousData
            };

            const response = await axios.put(
                `http://localhost:8000/api/update/students/${id}`,
                updateData,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setSuccessMessage('Student updated successfully');
                setTimeout(() => {
                    navigate('/admin/students');
                }, 2000);
            }
        } catch (error) {
            console.error('Error updating student:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update student';
            setError(errorMessage);
            window.scrollTo(0, 0); // Scroll to top to show error message
        }
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Edit Student</title>
            </Helmet>
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    transition: 'margin-left 0.3s',
                    flexGrow: 1,
                    marginTop: '3.5rem'
                }}>
                    <div className="container-fluid px-4 mb-5 form-top">
                        {error && <div className="alert alert-danger">{error}</div>}
                        {successMessage && <div className="alert alert-success">{successMessage}</div>}

                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="fa-solid fa-pen me-2"></i>
                                        <strong>Edit Student</strong>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Student Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control system"
                                                    value={studentData.name}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Student ID</label>
                                                <input
                                                    type="text"
                                                    name="studentId"
                                                    className="form-control system"
                                                    value={studentData.studentId}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Institutional Email</label>
                                                <input
                                                    type="email"
                                                    name="institutionalEmail"
                                                    className="form-control"
                                                    value={studentData.institutionalEmail}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Year Level</label>
                                                <input
                                                    type="text"
                                                    name="yearLevel"
                                                    className="form-control"
                                                    value={studentData.yearLevel}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Choose Program</label>
                                                <select
                                                    className="form-control form-select"
                                                    name="program"
                                                    value={studentData.program}
                                                    onChange={handleInputChange}
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
                                                <button type="submit" className="btn system-button update-button d-flex align-items-center"> <i className="fas fa-pen me-2"></i>Update</button>
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
                        Are you sure you want to update the information for <strong>{studentData.name}</strong>?
                    </p>
                    <div className="mt-3" style={{ fontSize: '0.95rem' }}>
                        <p className="mb-1">Updated Information:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><strong>Student ID:</strong> {studentData.studentId}</li>
                            <li><strong>Program:</strong> {studentData.program}</li>
                            <li><strong>Year Level:</strong> {studentData.yearLevel}</li>
                            <li><strong>Email:</strong> {studentData.institutionalEmail}</li>
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
                        <button
                            type="button"
                            onClick={handleSubmit}
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
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminEditStud;