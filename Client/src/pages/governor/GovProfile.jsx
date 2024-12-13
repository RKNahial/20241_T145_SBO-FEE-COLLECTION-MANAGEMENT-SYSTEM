// src/pages/governor/GovProfile.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import GovSidebar from "./GovSidebar"; 
import GovNavbar from "./GovNavbar";
import axios from 'axios';
import { toast } from 'react-toastify';

const GovProfile = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ID: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGovernorProfile();
    }, []);

    const fetchGovernorProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/governor/profile', {
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
            toast.error('Failed to load profile data');
            setLoading(false);
        }
    };

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
            const response = await axios.put(
                'http://localhost:8000/api/governor/profile/update',
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
                toast.success('Profile updated successfully');
                fetchGovernorProfile();
            } else {
                toast.error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | Profile</title>
            </Helmet>
            <GovNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <GovSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    transition: 'margin-left 0.3s',
                    flexGrow: 1,
                    marginTop: '3.5rem'
                }}>
                    <div className="container-fluid px-4 py-4">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="card shadow-sm border-0">
                                    <div className="card-header bg-white py-3">
                                        <h5 className="card-title mb-0">
                                            <i className="fas fa-user-circle text-primary me-2"></i>
                                            Profile Settings
                                        </h5>
                                    </div>
                                    <div className="card-body p-4">
                                        {loading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="needs-validation">
                                                <div className="row g-4">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label fw-semibold">Full Name</label>
                                                            <div className="input-group">
                                                                <span className="input-group-text bg-light">
                                                                    <i className="fas fa-user"></i>
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="name"
                                                                    value={formData.name}
                                                                    onChange={handleChange}
                                                                    placeholder="Enter your full name"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label fw-semibold">Governor ID</label>
                                                            <div className="input-group">
                                                                <span className="input-group-text bg-light">
                                                                    <i className="fas fa-id-card"></i>
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    name="ID"
                                                                    value={formData.ID}
                                                                    onChange={handleChange}
                                                                    placeholder="Enter your ID"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="form-group">
                                                            <label className="form-label fw-semibold">Email Address</label>
                                                            <div className="input-group">
                                                                <span className="input-group-text bg-light">
                                                                    <i className="fas fa-envelope"></i>
                                                                </span>
                                                                <input
                                                                    type="email"
                                                                    className="form-control"
                                                                    name="email"
                                                                    value={formData.email}
                                                                    onChange={handleChange}
                                                                    placeholder="Enter your email address"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <div className="form-group">
                                                            <label className="form-label fw-semibold">Change Password</label>
                                                            <div className="input-group">
                                                                <span className="input-group-text bg-light">
                                                                    <i className="fas fa-lock"></i>
                                                                </span>
                                                                <input
                                                                    type="password"
                                                                    className="form-control"
                                                                    name="password"
                                                                    value={formData.password}
                                                                    onChange={handleChange}
                                                                    placeholder="Enter new password (leave blank to keep current)"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-12">
                                                        <button 
                                                            type="submit" 
                                                            className="btn btn-sm"
                                                            style={{ backgroundColor: 'orange', color: 'white', width: 'auto', padding: '0.375rem 0.75rem' }}
                                                        >
                                                            <i className="fas fa-save me-2"></i>
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        )}
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

export default GovProfile;