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
                <title>Edit Student | CICT Fee Collection Management System</title>
            </Helmet>
            <GovNavbar toggleSidebar={toggleSidebar} />
            <div id="layoutSidenav">
                <GovSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content">
                    <main
                        className="p-4"
                        style={{
                            marginTop: '20px',
                            backgroundColor: '#F0F0F0'
                        }}
                    >
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <h4 className="mb-0">Edit Student</h4>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={studentData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Student ID</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="studentId"
                                                    value={studentData.studentId}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Institutional Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="institutionalEmail"
                                                    value={studentData.institutionalEmail}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Program</label>
                                                <select 
                                                    className="form-control form-select" 
                                                    name="program"
                                                    value={studentData.program}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="" disabled>Select a program</option>
                                                    <option value="BSIT">BSIT</option>
                                                    <option value="BSEMC">BSEMC</option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Year Level</label>
                                                <select 
                                                    className="form-control form-select" 
                                                    name="yearLevel"
                                                    value={studentData.yearLevel}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="" disabled>Select year level</option>
                                                    <option value="1st Year">1st Year</option>
                                                    <option value="2nd Year">2nd Year</option>
                                                    <option value="3rd Year">3rd Year</option>
                                                    <option value="4th Year">4th Year</option>
                                                </select>
                                            </div>
                                            <div className="d-flex justify-content-start">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-sm"
                                                    style={{ backgroundColor: 'orange', color: 'white', width: 'auto', padding: '0.375rem 0.75rem' }}
                                                >
                                                    <i className="fas fa-save me-2"></i>
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default GovEditStud;