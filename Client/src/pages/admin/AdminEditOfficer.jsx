// src/pages/admin/AdminEditOfficer.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';
import { Modal } from 'react-bootstrap';

const AdminEditOfficer = () => {
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
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch officer data
    useEffect(() => {
        const fetchOfficer = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8000/api/officials/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const officialData = response.data.data;
                setFormData({
                    name: officialData.name,
                    ID: officialData.ID,
                    email: officialData.email,
                    position: officialData.position || officialData.type,
                    type: officialData.type
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
        if (e.target.name === 'email') {
            // Split email into username and domain
            const currentEmail = formData.email;
            const [, domain] = currentEmail.split('@');
            
            // Only allow editing the username part
            const newUsername = e.target.value.split('@')[0];
            setFormData({
                ...formData,
                email: newUsername + '@' + domain
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        }
    };

    const [showModal, setShowModal] = useState(false);

    // Modify handleSubmit to show modal first
    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    // Add confirmUpdate function with the original submission logic
    const confirmUpdate = async () => {
        setShowModal(false);
        setError(null);
        setSuccessMessage('');

        try {
            if (!formData.name || !formData.ID || !formData.email || !formData.position) {
                setError('All fields are required');
                return;
            }

            if (formData.position !== 'Admin' && !formData.email.endsWith('@student.buksu.edu.ph')) {
                setError('Student email must end with @student.buksu.edu.ph');
                return;
            }

            const token = localStorage.getItem('token');
            let officialType = formData.type;
            if (['Officer', 'Treasurer', 'Governor'].includes(formData.position)) {
                officialType = formData.position;
            }

            const response = await axios.put(
                `http://localhost:8000/api/officials/${id}`,
                {
                    name: formData.name,
                    ID: formData.ID,
                    email: formData.email,
                    position: formData.position,
                    type: officialType
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setSuccessMessage('Officer updated successfully');
                setTimeout(() => {
                    navigate('/admin/officers');
                }, 2000);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error updating officer';
            setError(errorMessage);
            window.scrollTo(0, 0);
        }
    };


    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const getPositionOptions = () => {
        return [
            { value: 'Officer', label: 'Officer', icon: 'fa-user-tie' },
            { value: 'Governor', label: 'Governor', icon: 'fa-user-shield' },
            { value: 'Treasurer', label: 'Treasurer', icon: 'fa-user-graduate' }
        ];
    };

    const getPositionIcon = (position) => {
        const option = getPositionOptions().find(opt => opt.value === position);
        return option ? option.icon : 'fa-user';
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Edit Officer</title>
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
                                        <strong>Edit Officer</strong>
                                    </div>
                                    <div className="card-body">
                                         {error && <div className="alert alert-danger">{error}</div>}
                                            {successMessage && (
                                                <div className="alert alert-success">{successMessage}</div>
                                            )}
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Officer Name</label>
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
                                                <label className="mb-1">Officer ID</label>
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
                                                    className="form-control system"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Position</label>
                                                <select
                                                    name="position"
                                                    className="form-control system"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    required
                                                    style={{ paddingLeft: '35px', position: 'relative' }}
                                                >
                                                    <option value="">
                                                        Select Position
                                                    </option>
                                                    {getPositionOptions().map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <i 
                                                    className={`fas ${getPositionIcon(formData.position)} position-icon`}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '25px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        color: '#6c757d',
                                                        pointerEvents: 'none'
                                                    }}
                                                ></i>
                                            </div>
                                            <style>
                                                {`
                                                    .position-select-container {
                                                        position: relative;
                                                    }
                                                    .position-icon {
                                                        position: absolute;
                                                        left: 10px;
                                                        top: 50%;
                                                        transform: translateY(-50%);
                                                        color: #6c757d;
                                                        pointerEvents: none;
                                                    }
                                                    select.form-control {
                                                        padding-left: 35px;
                                                        appearance: auto;
                                                    }
                                                    select.form-control option {
                                                        padding: 10px;
                                                    }
                                                `}
                                            </style>
                                            <div className="mb-0">
                                                <button
                                                    type="submit"
                                                    className="btn system-button update-button d-flex align-items-center"
                                                >
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

export default AdminEditOfficer;