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
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    useEffect(() => {
        fetchGovernorProfile();
    }, []);

    const handleConfirmUpdate = async () => {
        setIsModalOpen(false);
        try {
            const token = localStorage.getItem('token');
            const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    
            const response = await axios.put(
                `http://localhost:8000/api/profile/${userDetails.email}/${userDetails.position}`,
                {
                    name: formData.name,
                    ID: formData.ID,
                    email: formData.email,
                    password: formData.password || undefined,
                    position: userDetails.position
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            if (response.data.success) {
                // Add both toast and success message
                toast.success('Profile updated successfully');
                setSuccessMessage('Profile updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
    
                // Update local storage with new details
                const updatedDetails = {
                    ...userDetails,
                    name: formData.name,
                    email: formData.email
                };
                localStorage.setItem('userDetails', JSON.stringify(updatedDetails));
                
                // Fetch updated profile
                fetchGovernorProfile();
            } else {
                toast.error(response.data.message || 'Failed to update profile');
                setError(response.data.message || 'Failed to update profile');
                setTimeout(() => setError(null), 3000);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
            setError(error.response?.data?.message || 'Failed to update profile');
            setTimeout(() => setError(null), 3000);
        }
    };

    const fetchGovernorProfile = async () => {
        try {
            const userDetails = JSON.parse(localStorage.getItem('userDetails'));
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `http://localhost:8000/api/profile/${userDetails.email}/${userDetails.position}`, // Updated API endpoint
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                const profileData = response.data.profile;
                setFormData({
                    name: profileData.name || '',
                    ID: profileData.ID || '',
                    email: profileData.email || '',
                    password: ''
                });
            }
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | Profile</title>
            </Helmet>
            <GovNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <GovSidebar isCollapsed={isCollapsed} />
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
                                        {loading ? (
                                            <div className="text-center py-4">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label className="mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className="form-control system"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="mb-1">Governor ID</label>
                                                    <input
                                                        type="text"
                                                        name="ID"
                                                        className="form-control"
                                                        value={formData.ID}
                                                        onChange={handleChange}
                                                        placeholder="Enter your ID"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="mb-1">Email Address</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className="form-control"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        placeholder="Enter your email address"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="mb-1">Change Password</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="password"
                                                            name="password"
                                                            className="form-control system"
                                                            value={formData.password}
                                                            onChange={handleChange}
                                                            placeholder="Enter new password (leave blank to keep current)"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary"
                                                            onClick={() => setFormData(prev => ({ ...prev, password: '' }))}
                                                        >
                                                            <i className="fas fa-eye-slash"></i>
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
                                        )}
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
                                    <li><strong>Email:</strong> {formData.email}</li>
                                    <li><strong>ID:</strong> {formData.ID}</li>
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

export default GovProfile;