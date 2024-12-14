import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import GovSidebar from "./GovSidebar"; 
import GovNavbar from "./GovNavbar";
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:8000';

const GovEditStud = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    
    const [studentData, setStudentData] = useState({
        name: '',
        studentId: '',
        institutionalEmail: '',
        yearLevel: '',
        program: '',
        status: '',
        isArchived: false
    });

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                let data;
                if (location.state?.studentData) {
                    data = location.state.studentData;
                } else {
                    const token = localStorage.getItem('token');
                    const response = await axios.get(`${API_URL}/api/getAll/students/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.data.success) {
                        data = response.data.data;
                    } else {
                        throw new Error(response.data.message || 'Failed to fetch student data');
                    }
                }
                
                setStudentData({
                    name: data.name || '',
                    studentId: data.studentId || '',
                    institutionalEmail: data.institutionalEmail || '',
                    yearLevel: data.yearLevel || '',
                    program: data.program || '',
                    status: data.status || '',
                    isArchived: data.isArchived || false
                });
            } catch (err) {
                console.error('Error fetching student:', err);
                setError(err.message || 'Failed to fetch student data');
                setTimeout(() => {
                    navigate('/governor/students');
                }, 2000);
            }
        };

        fetchStudentData();
    }, [id, location.state, navigate]);

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
            
            const updateData = {
                name: studentData.name,
                studentId: studentData.studentId,
                institutionalEmail: studentData.institutionalEmail,
                yearLevel: studentData.yearLevel,
                program: studentData.program,
                previousData
            };

            const response = await axios.put(
                `${API_URL}/api/update/students/${id}`,
                updateData,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Student information updated successfully',
                    confirmButtonColor: '#FF8C00'
                }).then(() => {
                    navigate('/governor/students');
                });
            }
        } catch (error) {
            console.error('Error updating student:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update student information',
                confirmButtonColor: '#FF8C00'
            });
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const handleExit = () => {
        navigate('/governor/students');
    };

    if (error) {
        return (
            <div className="alert alert-danger m-4">
                {error}
                <div>Redirecting to students list...</div>
            </div>
        );
    }

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | Edit Student</title>
            </Helmet>
            <GovNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <div style={{ display: 'flex' }}>
                <GovSidebar isCollapsed={isCollapsed} />
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
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Student Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={studentData.name}
                                                    onChange={handleInputChange}
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
                                                    value={studentData.studentId}
                                                    onChange={handleInputChange}
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
                                                    value={studentData.institutionalEmail}
                                                    onChange={handleInputChange}
                                                    className="form-control"
                                                    placeholder="Enter institutional email"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Program</label>
                                                <select
                                                    name="program"
                                                    value={studentData.program}
                                                    onChange={handleInputChange}
                                                    className="form-select"
                                                    required
                                                >
                                                    <option value="">Select Program</option>
                                                    <option value="BSIT">BSIT</option>
                                                    <option value="BSEMC">BSEMC</option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Year Level</label>
                                                <select
                                                    name="yearLevel"
                                                    value={studentData.yearLevel}
                                                    onChange={handleInputChange}
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
                                            <div className="d-flex justify-content-start">
                                                <button type="submit" className="btn system-button update-button d-flex align-items-center">
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
        `    <Modal show={showModal} onHide={() => setShowModal(false)}>
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

            {/* Exit Confirmation Modal */}
            <div className={`modal fade ${showExitModal ? 'show' : ''}`} style={{ display: showExitModal ? 'block' : 'none' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Exit</h5>
                            <button type="button" className="btn-close" onClick={() => setShowExitModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to exit? Any unsaved changes will be lost.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowExitModal(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={confirmExit}>Exit</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Backdrop */}
            {(showModal || showExitModal) && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default GovEditStud;