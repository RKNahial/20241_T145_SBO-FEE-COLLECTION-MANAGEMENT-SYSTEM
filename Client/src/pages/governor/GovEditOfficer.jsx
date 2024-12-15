// src/pages/Gov/GovEditOfficer.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GovSidebar from "./GovSidebar"; 
import GovNavbar from "./GovNavbar";
import axios from 'axios';
import { Modal } from 'react-bootstrap';

const GovEditOfficer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showModal, setShowModal] = useState(false);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };
    
    const confirmUpdate = async () => {
        setShowModal(false);
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
                                                    <button type="submit" className="btn system-button update-button d-flex align-items-center">
                                                        <i className="fa-solid fa-pen me-1"></i> Update
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
            {/* Add Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title>
                        Confirm Update Officer
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to update the information for <strong>{formData.name}</strong>?
                    </p>
                    <div className="mt-3" style={{ fontSize: '0.95rem' }}>
                        <p className="mb-1">Updated Information:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><strong>Officer ID:</strong> {formData.ID}</li>
                            <li><strong>Position:</strong> {formData.position}</li>
                            <li><strong>Email:</strong> {formData.email}</li>
                        </ul>
                    </div>
                    <small style={{ color: '#6c757d', fontSize: '0.90rem' }}>
                        Please review the details carefully before confirming.
                    </small>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={confirmUpdate}
                            style={{
                                borderRadius: '0.35rem',
                                color: '#EAEAEA',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                backgroundColor: '#FF8C00',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#E67E22'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#FF8C00'}
                        >
                            Confirm
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            style={{
                                borderRadius: '0.35rem',
                                color: '#EAEAEA',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                backgroundColor: 'red',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#cc0000'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'red'}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default GovEditOfficer;