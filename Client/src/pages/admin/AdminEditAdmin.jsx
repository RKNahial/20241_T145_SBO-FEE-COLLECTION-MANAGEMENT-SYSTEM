// src/pages/admin/AdminEditAdmin.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';

const AdminEditAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ID: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch admin data
    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/admins/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { name, ID, email } = response.data.data;
                setFormData({ name, ID, email });
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch admin data');
                setLoading(false);
            }
        };
        fetchAdmin();
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
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:8000/api/admins/${id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setSuccessMessage('Admin updated successfully');
            setTimeout(() => navigate('/admin/admins'), 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error updating admin');
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Edit Admin</title>
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
                                        <strong>Edit Admin</strong>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Admin Name</label>
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
                                                <label className="mb-1">Admin ID</label>
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

export default AdminEditAdmin;