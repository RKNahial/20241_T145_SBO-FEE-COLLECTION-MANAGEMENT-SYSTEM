// src/pages/treasurer/TreasurerProfile.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import axios from 'axios';

const TreasurerProfile = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [profile, setProfile] = useState({
        name: '',
        ID: '',
        email: '',
        position: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

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
                        ID: profileData.ID || '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!profile.ID) {
                setError('School ID is required');
                setTimeout(() => setError(null), 3000);
                return;
            }

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
            {/* NAVBAR AND SIDEBAR */}
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
                    {/* CONTENT */}
                    <div className="container-fluid mb-5 form-top">
                        {loading ? (
                            <div>Loading profile...</div>
                        ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                        ) : (
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card mb-4">
                                        <div className="card-header">
                                            <i className="fas fa-user-edit"></i> <span style={{ paddingLeft: '0.50rem', fontWeight: 'bold' }}>Edit Profile</span>
                                        </div>
                                        <div className="card-body">
                                            {successMessage && (
                                                <div className="alert alert-success">{successMessage}</div>
                                            )}
                                            <form onSubmit={handleSubmit}>
                                                <div className="mb-3">
                                                    <label className="mb-1">Treasurer Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        className="form-control system"
                                                        value={profile.name}
                                                        onChange={handleChange}
                                                    />
                                                </div>


                                                <div className="mb-3">
                                                    <label className="mb-1">Email Address</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className="form-control"
                                                        value={profile.email}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="mb-1">Position</label>
                                                    <input
                                                        type="text"
                                                        name="position"
                                                        className="form-control"
                                                        value={profile.position}
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
                                                            value={profile.password}
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
                                                    <button type="submit" className="btn system-button">
                                                        <i className="fa-solid fa-pen me-2"></i>Save
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreasurerProfile;
