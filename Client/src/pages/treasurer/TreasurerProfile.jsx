// src/pages/treasurer/TreasurerProfile.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import axios from 'axios';

const TreasurerProfile = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        position: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userDetails = JSON.parse(localStorage.getItem('userDetails'));
                if (!userDetails) {
                    throw new Error('No user details found');
                }

                const response = await axios.get(
                    `http://localhost:8000/api/profile/${userDetails.email}/${userDetails.position}`
                );

                if (response.data.success) {
                    const profileData = response.data.profile;
                    setProfile({
                        name: profileData.name || '',
                        email: profileData.email || '',
                        position: profileData.position || '',
                        password: ''
                    });
                }
            } catch (err) {
                setError('Failed to load profile');
                console.error('Error loading profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password);

        if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
        if (!hasNumber) return 'Password must contain at least one number';
        if (!hasSpecialChar) return 'Password must contain at least one special character';
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsModalOpen(true); 
    };

    const handleConfirmUpdate = async () => {
        setIsModalOpen(false); 
        try {
            if (profile.password) {
                const passwordError = validatePassword(profile.password);
                if (passwordError) {
                    setError(passwordError);
                    setTimeout(() => setError(null), 3000);
                    return;
                }
            }

            const userDetails = JSON.parse(localStorage.getItem('userDetails'));
            const response = await axios.put(
                `http://localhost:8000/api/profile/${userDetails.email}/${userDetails.position}`,
                profile
            );

            if (response.data.success) {
                setSuccessMessage('Profile updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            setError('Failed to update profile');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleChange = (e) => {
        setProfile(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Profile</title>
            </Helmet>
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
                <div 
                    id="layoutSidenav_content" 
                    style={{ 
                        marginLeft: isCollapsed ? '5rem' : '15.625rem', 
                        transition: 'margin-left 0.3s', 
                        flexGrow: 1,
                        marginTop: '3.5rem' 
                    }}
                >
                    <div className="container-fluid px-4 py-4">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white py-3 border-0">
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-primary bg-opacity-10 p-3">
                                                <i className="fas fa-user-edit text-primary"></i>
                                            </div>
                                            <h5 className="mb-0 ms-3 fw-bold">Profile Settings</h5>
                                        </div>
                                    </div>
                                    <div className="card-body p-4">
                                        {error && (
                                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                                <i className="fas fa-exclamation-circle me-2"></i>
                                                {error}
                                            </div>
                                        )}
                                        {successMessage && (
                                            <div className="alert alert-success d-flex align-items-center" role="alert">
                                                <i className="fas fa-check-circle me-2"></i>
                                                {successMessage}
                                            </div>
                                        )}
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold">Treasurer Name</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-0">
                                                        <i className="fas fa-user text-muted"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className="form-control border-0 bg-light ps-2"
                                                        value={profile.name}
                                                        onChange={handleChange}
                                                        placeholder="Enter your name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold">Email Address</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-0">
                                                        <i className="fas fa-envelope text-muted"></i>
                                                    </span>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className="form-control border-0 bg-light ps-2"
                                                        value={profile.email}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold">Position</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-0">
                                                        <i className="fas fa-briefcase text-muted"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="position"
                                                        className="form-control border-0 bg-light ps-2"
                                                        value={profile.position}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold">Password</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-0">
                                                        <i className="fas fa-lock text-muted"></i>
                                                    </span>
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        className="form-control border-0 bg-light ps-2"
                                                        value={profile.password}
                                                        onChange={handleChange}
                                                        placeholder="Enter new password (leave empty to keep current)"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-light border-0"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-muted`}></i>
                                                    </button>
                                                </div>
                                                <div className="form-text mt-2">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Password must contain at least one uppercase letter, one number, and one special character
                                                </div>
                                            </div>
                                            <div className="d-grid">
                                                <button type="submit" className="btn btn-primary py-2 fw-semibold">
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

                    {/* Confirmation Modal */}
                    {isModalOpen && (
                        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content border-0 shadow">
                                    <div className="modal-header border-0">
                                        <h5 className="modal-title fw-bold">Confirm Update</h5>
                                        <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="text-center mb-4">
                                            <div className="rounded-circle bg-warning bg-opacity-10 p-3 d-inline-block">
                                                <i className="fas fa-exclamation-triangle text-warning fs-4"></i>
                                            </div>
                                            <p className="mt-3 mb-0">Are you sure you want to update your profile?</p>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button type="button" className="btn btn-light fw-semibold" onClick={() => setIsModalOpen(false)}>
                                            Cancel
                                        </button>
                                        <button type="button" className="btn btn-primary fw-semibold" onClick={handleConfirmUpdate}>
                                            Confirm Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-backdrop fade show"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreasurerProfile;