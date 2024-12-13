// src/pages/admin/AdminProfile.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminProfile = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ID: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchAdminProfile();
    }, []);

    const fetchAdminProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/admin/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { data } = response.data;
            setFormData({
                name: data.name || '',
                ID: data.ID || '',
                email: data.email || '',
                password: ''
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile data');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handleConfirmUpdate = async () => {
        setIsModalOpen(false);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:8000/api/admin/profile/update',
                {
                    name: formData.name,
                    ID: formData.ID,
                    email: formData.email,
                    password: formData.password || undefined
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSuccessMessage('Profile updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
                fetchAdminProfile();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update profile');
            setTimeout(() => setError(null), 3000);
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Profile</title>
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
                    <div className="container-fluid mb-5 form-top">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="fas fa-user-edit"></i> 
                                        <span style={{ paddingLeft: '0.50rem', fontWeight: 'bold' }}>Update Profile</span>
                                    </div>
                                    <div className="card-body">
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Admin Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control system"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your name"
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
                                                    placeholder="Enter your ID"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    value={formData.email}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Password</label>
                                                <div className="input-group">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        className="form-control system"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        placeholder="Enter new password (leave empty to keep current)"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                    </button>
                                                </div>
                                                <small className="text-muted">
                                                    Password must contain at least one uppercase letter, one number, and one special character
                                                </small>
                                            </div>
                                            <div className="mb-0">
                                                <button type="submit" className="btn update-button d-flex align-items-center">
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
            {isModalOpen && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Profile Update</h5>
                                <button type="button" className="close" onClick={() => setIsModalOpen(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to update your profile with the following details?</p>
                                <ul>
                                    <li><strong>Name:</strong> {formData.name}</li>
                                    <li><strong>ID:</strong> {formData.ID}</li>
                                    <li><strong>Email:</strong> {formData.email}</li>
                                </ul>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-confirm" onClick={handleConfirmUpdate}>Confirm</button>
                                <button type="button" className="btn btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfile;