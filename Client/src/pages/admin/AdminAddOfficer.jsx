// src/pages/admin/AdminAddOfficer.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';

const AdminAddOfficer = () => {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ID: '',
        email: '',
        position: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8000/api/users/register',
                { ...formData },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.temporaryPassword) {
                setSuccess(`Officer added successfully!\nTemporary Password: ${response.data.temporaryPassword}`);
            } else {
                setError('No temporary password received from server');
                return;
            }

            setTimeout(() => {
                navigate('/admin/officers');
            }, 10000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add officer');
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Add Officer</title>
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
                        {success && (
                            <div className="alert alert-success">
                                <div className="mb-2" style={{ whiteSpace: 'pre-line' }}>{success}</div>
                                <div className="mt-2 small text-muted">
                                    Please save this password. It will only be shown once.
                                    <br />
                                    Page will redirect in 10 seconds...
                                </div>
                            </div>
                        )}
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="far fa-plus me-2"></i>
                                        <strong>Add New Officer</strong>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Officer Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter officer name"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Officer ID</label>
                                                <input
                                                    type="text"
                                                    name="ID"
                                                    value={formData.ID}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter officer ID"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Institutional Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="form-control"
                                                    placeholder="Enter institutional email"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Choose Position</label>
                                                <select
                                                    className="form-control form-select"
                                                    name="position"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="" disabled>Select a position</option>
                                                    <option value="officer">Officer</option>
                                                    <option value="governor">Governor</option>
                                                    <option value="treasurer">Treasurer</option>
                                                </select>
                                            </div>
                                            <div className="mb-0">
                                                <button type="submit" className="btn system-button">
                                                    <i className="far fa-plus me-1"></i> Add
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

export default AdminAddOfficer;