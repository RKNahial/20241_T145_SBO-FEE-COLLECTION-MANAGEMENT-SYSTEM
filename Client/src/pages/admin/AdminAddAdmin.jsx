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
        position: 'Admin'  // Default value since this is for adding admins
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
            console.error('Error details:', error);
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
                <div id="layoutSidenav_content" style={{
                    flex: '1',
                    marginLeft: isCollapsed ? '70px' : '250px',  // Adjust these values based on your sidebar width
                    transition: 'margin-left 0.3s ease-in-out',
                    position: 'relative',
                    zIndex: 0
                }}>
                    <div className="container-fluid px-4">
                        <div className="row align-items-center">
                            <div className="col-6">
                                <h1 className="mt-4 mb-4">Add Admin</h1>
                            </div>
                        </div>

                        {message && (
                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="row">
                            <div className="col-lg-12">
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Admin Name</label>
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
                                                <label className="mb-1">Admin ID</label>
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
                                                <label className="mb-1">Email</label>
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
                                                    className="btn system-button"
                                                >
                                                    <i className="far fa-plus me-1"></i> Add
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