// src/pages/admin/AdminAddAdmin.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';

const AdminAddAdmin = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        ID: '',
        name: '',
        email: '',
        position: 'Admin'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [temporaryPassword, setTemporaryPassword] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:8000/api/users/register',
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccessMessage('Admin added successfully');
            setTemporaryPassword(response.data.data.temporaryPassword);
            setFormData({ ID: '', name: '', email: '', position: 'Admin' });
        } catch (error) {
            setError(error.response?.data?.message || 'Error adding admin');
        } finally {
            setLoading(false);
        }
    };

    // NAV AND SIDEBAR
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Add Admin</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
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
                    {/* CONTENT */}
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="far fa-plus me-2"></i> <strong>Add New Admin</strong>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Admin Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control system"
                                                    placeholder="Enter admin name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Admin ID</label>
                                                <input
                                                    type="text"
                                                    name="ID"
                                                    className="form-control system"
                                                    placeholder="Enter admin ID"
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
                                                    placeholder="Enter institutional email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            {error && <div className="alert alert-danger">{error}</div>}
                                            {successMessage && (
                                                <div className="alert alert-success">
                                                    {successMessage}
                                                    {temporaryPassword && (
                                                        <div>
                                                            Temporary Password: <strong>{temporaryPassword}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="mb-0">
                                                <button
                                                    type="submit"
                                                    className="btn system-button"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Adding...' : <><i className="far fa-plus me-1"></i> Add</>}
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

export default AdminAddAdmin;