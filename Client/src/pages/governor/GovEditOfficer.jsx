// src/pages/Gov/GovEditOfficer.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GovSidebar from "./GovSidebar"; 
import GovNavbar from "./GovNavbar";
import axios from 'axios';

const GovEditOfficer = () => {
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Fetch officer data
    useEffect(() => {
        const fetchOfficer = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/officials/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const officerData = response.data.data;
                setFormData({
                    name: officerData.name || '',
                    ID: officerData.ID || '',
                    email: officerData.email || '',
                    position: officerData.position || '',
                    type: officerData.type || ''
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
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/officials/${id}`,
                { ...formData, type: formData.position.charAt(0).toUpperCase() + formData.position.slice(1) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess('Officer updated successfully!');
            setTimeout(() => {
                navigate('/governor/officers');
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update officer');
        }
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | Edit Officer</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
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
                    {/* CONTENT */}
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="far fa-edit me-2"></i> <strong>Edit Officer</strong>
                                    </div>
                                    <div className="card-body">
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {success && <div className="alert alert-success">{success}</div>}
                                        {loading ? (
                                            <div className="text-center">Loading officer data...</div>
                                        ) : (
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
                                                        <option value="Officer">Officer</option>
                                                        <option value="Governor">Governor</option>
                                                        <option value="Treasurer">Treasurer</option>
                                                    </select>
                                                </div>
                                                <div className="mb-0">
                                                    <button type="submit" className="btn system-button">
                                                        <i className="far fa-save me-1"></i> Save Changes
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
        </div>
    );
};

export default GovEditOfficer;