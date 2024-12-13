// src/pages/admin/AdminAddAdmin.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminAddAdmin = () => {
    const [formData, setFormData] = useState({
        name: '',
        ID: '',
        email: '',
        position: 'Admin'  
    });

    const [message, setMessage] = useState(null);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => setIsCollapsed(prev => !prev);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const confirmSubmit = async () => {
        setShowModal(false);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.post(
                'http://localhost:8000/api/users/admin/add',
                formData,
                config
            );

            // Log successful response
            console.log('Admin Addition Response:', {
                status: response.status,
                message: 'Admin added successfully',
                data: response.data
            });

            if (response.data.data?.temporaryPassword) {
                setMessage({
                    type: 'success',
                    text: `Admin added successfully!\nTemporary Password: ${response.data.data.temporaryPassword}`
                });

                setTimeout(() => {
                    navigate('/admin/admins');
                }, 10000);
            } else {
                setMessage({
                    type: 'error',
                    text: 'No temporary password received from server'
                });
            }
        } catch (error) {
            // Log error details
            console.error('Admin Addition Error:', {
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Unknown error occurred',
                error: error.response?.data || error.message
            });

            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to add admin. Please try again.'
            });
        }
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Add Admin</title>
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
                                        <i className="fas fa-user-plus me-2"></i>
                                        <strong>Add Admin</strong>
                                    </div>
                                    <div className="card-body">
                                        {message && (
                                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                                {message.text.split('\n').map((line, i) => (
                                                    <div key={i}>{line}</div>
                                                ))}
                                            </div>
                                        )}
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="small mb-1">Admin Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter admin name"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="small mb-1">Admin ID</label>
                                                <input
                                                    type="text"
                                                    name="ID"
                                                    value={formData.ID}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter Admin ID"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="small mb-1">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="form-control"
                                                    placeholder="Enter email address"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-0">
                                                <button
                                                    type="submit"
                                                    className="btn system-button update-button d-flex align-items-center"
                                                >
                                                    <i className="fas fa-plus me-2"></i>Add
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

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Add Admin</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you want to add <strong>{formData.name}</strong> as an admin?
                </Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="btn btn-confirm"
                        onClick={confirmSubmit}
                        style={{ flex: 'none' }}
                    >
                        Confirm
                    </Button>
                    <Button
                        variant="btn btn-cancel"
                        onClick={() => setShowModal(false)}
                        style={{ marginRight: '0.5rem', flex: 'none' }}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
export default AdminAddAdmin;