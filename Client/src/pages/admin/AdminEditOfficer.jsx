// src/pages/admin/AdminEditOfficer.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';

const AdminEditOfficer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ID: '',
        email: '',
        position: '',
        type: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch officer data
    useEffect(() => {
        const fetchOfficer = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/officials/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const officialData = response.data.data;
                setFormData({
                    name: officialData.name,
                    ID: officialData.ID,
                    email: officialData.email,
                    position: officialData.position || officialData.type,
                    type: officialData.type
                });
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch officer data');
                setLoading(false);
            }
        };
        fetchOfficer();
    }, [id]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');

        try {
            if (!formData.name || !formData.ID || !formData.email || !formData.position) {
                setError('All fields are required');
                return;
            }

            // Email validation based on position
            if (formData.position !== 'Admin' && !formData.email.endsWith('@student.buksu.edu.ph')) {
                setError('Student email must end with @student.buksu.edu.ph');
                return;
            }

            const token = localStorage.getItem('token');
            
            // Map position to correct type
            let officialType = formData.type; // Keep original type by default
            if (['Officer', 'Treasurer', 'Governor'].includes(formData.position)) {
                officialType = formData.position;
            }

            const response = await axios.put(
                `http://localhost:8000/api/officials/${id}`,
                {
                    name: formData.name,
                    ID: formData.ID,
                    email: formData.email,
                    position: formData.position,
                    type: officialType
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setSuccessMessage('Official updated successfully');
                setTimeout(() => {
                    navigate('/admin/officers');
                }, 2000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error updating official';
            setError(errorMessage);
            window.scrollTo(0, 0);
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const getPositionOptions = () => {
        return [
            'Officer',
            'Governor',
            'Treasurer',
            'Admin'
        ];
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Edit Officer</title>
            </Helmet>
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
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
                                        <i className="far fa-edit me-2"></i>
                                        <strong>Edit Officer</strong>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Officer Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control system"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Officer ID</label>
                                                <input
                                                    type="text"
                                                    name="ID"
                                                    className="form-control system"
                                                    value={formData.ID}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Position</label>
                                                <select
                                                    className="form-control form-select"
                                                    name="position"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="" disabled>Select a position</option>
                                                    {getPositionOptions().map(position => (
                                                        <option key={position} value={position}>
                                                            {position}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {error && <div className="alert alert-danger">{error}</div>}
                                            {successMessage && (
                                                <div className="alert alert-success">{successMessage}</div>
                                            )}
                                            <div className="mb-0">
                                                <button
                                                    type="submit"
                                                    className="btn system-button"
                                                >
                                                    <i className="far fa-save me-1"></i> Save Changes
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
        </div>
    );
};

export default AdminEditOfficer;