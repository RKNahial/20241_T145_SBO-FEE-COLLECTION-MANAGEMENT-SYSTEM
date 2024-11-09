// src/pages/treasurer/TreasurerEditStud.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerEditStud = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    // Get the student data passed from the previous page
    const studentData = location.state?.studentData;

    // Initialize form data with student data
    const [formData, setFormData] = useState({
        studentId: '',
        name: '',
        yearLevel: '',
        program: '',
        // Add other fields as needed
    });

    // Set initial form data when component mounts
    useEffect(() => {
        if (studentData) {
            setFormData({
                studentId: studentData.studentId || '',
                name: studentData.name || '',
                yearLevel: studentData.yearLevel || '',
                program: studentData.program || '',
                // Add other fields as needed
            });
        }
    }, [studentData]);

    // Add this to your component to log the received data
    useEffect(() => {
        console.log('Received student data:', studentData);
        console.log('Current form data:', formData);
    }, [studentData, formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form data
            if (!formData.studentId || !formData.name || !formData.yearLevel || !formData.program) {
                setError('All fields are required');
                return;
            }

            console.log('Sending update request with data:', formData);
            console.log('Student ID:', id);

            const response = await fetch(`http://localhost:8000/api/students/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentId: formData.studentId,
                    name: formData.name,
                    yearLevel: formData.yearLevel,
                    program: formData.program
                })
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.message || 'Failed to update student');
            }

            const data = await response.json();
            console.log('Success response:', data);

            if (data.success) {
                setSuccessMessage(data.message || 'Student updated successfully!');
                setTimeout(() => {
                    navigate('/treasurer/students');
                }, 2000);
            } else {
                throw new Error(data.message || 'Failed to update student');
            }

        } catch (err) {
            console.error('Detailed error:', err);
            setError(err.message || 'Failed to update student. Please try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                    marginTop: '3.5rem',
                }}>
                    <div className="container-fluid px-4 mb-5">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="mb-0">Edit Student</h3>
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
                                        <label className="form-label">Student ID:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Name:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Year Level:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="yearLevel"
                                            value={formData.yearLevel}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Program:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="program"
                                            value={formData.program}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-primary">
                                            Update Student
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => navigate('/treasurer/students')}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreasurerEditStud;