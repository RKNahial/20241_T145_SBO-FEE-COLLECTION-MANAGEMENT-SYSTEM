// src/pages/admin/ManageControls.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useMemo } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import '../../assets/css/manage-control.css';
import { Card, Table, Button, Modal, Form, Badge, OverlayTrigger, Tooltip, Pagination } from 'react-bootstrap';
import axios from 'axios';

const ManageControls = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Governor');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState({ Governor: [], Treasurer: [], Officer: [] });
    const usersPerPage = 5;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/officials', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = response.data.data;

                // Convert positions to lowercase for case-insensitive comparison
                const groupedUsers = {
                    Governor: data.filter(user => user.position?.toLowerCase() === 'governor'),
                    Treasurer: data.filter(user => user.position?.toLowerCase() === 'treasurer'),
                    Officer: data.filter(user => user.position?.toLowerCase() === 'officer')
                };

                setUsers(groupedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on selected role and search term
    const filteredUsers = useMemo(() => {
        const roleUsers = users[selectedRole] || [];
        return roleUsers.filter(user => 
            (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            user.position?.toLowerCase() === selectedRole.toLowerCase()
        );
    }, [users, selectedRole, searchTerm]);

    // Reset current page when changing roles or search term
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedRole, searchTerm]);

    const currentUsers = useMemo(() => {
        return filteredUsers.slice(
            (currentPage - 1) * usersPerPage,
            currentPage * usersPerPage
        );
    }, [filteredUsers, currentPage, usersPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Pagination Controls Component
    const PaginationControls = () => {
        return (
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    Showing {Math.min(currentUsers.length, usersPerPage)} of {filteredUsers.length} entries
                </div>
                <Pagination className="mb-0">
                    <Pagination.Prev
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    />
                    {[...Array(totalPages)].map((_, idx) => (
                        <Pagination.Item
                            key={idx + 1}
                            active={currentPage === idx + 1}
                            onClick={() => setCurrentPage(idx + 1)}
                        >
                            {idx + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    />
                </Pagination>
            </div>
        );
    };

    // User Details Modal Component
    const UserDetailsModal = () => {
        const [permissions, setPermissions] = useState({
            addStudent: 'denied',
            addPaymentCategory: 'denied',
            updateStudent: 'denied',
            updatePaymentCategory: 'denied',
            archiveStudent: 'denied',
            unarchiveStudent: 'denied',
            toggleDuesPayment: 'denied',
            duesPayment: 'denied',
            paymentUpdate: 'denied',
            archiveCategory: 'denied',
            unarchiveCategory: 'denied',
            emailNotifications: 'denied'
        });
        const [loading, setLoading] = useState(true);
        const [savingPermissions, setSavingPermissions] = useState(false);
        const [unsavedChanges, setUnsavedChanges] = useState(false);

        // Permission labels for better display
        const permissionLabels = {
            addStudent: 'Add Student',
            addPaymentCategory: 'Add Payment Category',
            updateStudent: 'Update Student',
            updatePaymentCategory: 'Update Payment Category',
            archiveStudent: 'Archive Student',
            unarchiveStudent: 'Unarchive Student',
            toggleDuesPayment: 'Toggle Dues Payment',
            duesPayment: 'Dues Payment',
            paymentUpdate: 'Payment Update',
            archiveCategory: 'Archive Category',
            unarchiveCategory: 'Unarchive Category',
            emailNotifications: 'Email Notifications'
        };

        useEffect(() => {
            const fetchPermissions = async () => {
                if (selectedUser) {
                    try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(
                            `http://localhost:8000/api/permissions/${selectedUser._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setPermissions(response.data.data || permissions);
                    } catch (error) {
                        console.error('Error fetching permissions:', error);
                    } finally {
                        setLoading(false);
                    }
                }
            };
            fetchPermissions();
        }, [selectedUser]);

        const handlePermissionChange = (module, value) => {
            const updatedPermissions = {
                ...permissions,
                [module]: value
            };
            setPermissions(updatedPermissions);
            setUnsavedChanges(true);
        };

        const savePermissions = async () => {
            try {
                setSavingPermissions(true);
                const token = localStorage.getItem('token');
                await axios.put(
                    `http://localhost:8000/api/permissions/${selectedUser._id}`,
                    {
                        userId: selectedUser._id,
                        userName: selectedUser.name,
                        position: selectedUser.position,
                        permissions: permissions
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setUnsavedChanges(false);
            } catch (error) {
                console.error('Error updating permissions:', error);
            } finally {
                setSavingPermissions(false);
            }
        };

        const getPageNumbers = (currentPage, totalPages) => {
            let startPage = Math.max(currentPage - 2, 1);
            let endPage = Math.min(startPage + 4, totalPages);
        
            if (endPage - startPage < 4) {
                startPage = Math.max(endPage - 4, 1);
            }
        
            return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
        };

        return (
            <Modal 
                show={showUserModal} 
                onHide={() => setShowUserModal(false)} 
                size="lg"
                backdrop="static"
            >
                <Modal.Header>
                    <Modal.Title>
                        <i className="fas fa-user-shield me-2 text-primary"></i>
                        Manage Access Permissions - {selectedUser?.name}
                    </Modal.Title>
                    {unsavedChanges && (
                        <Badge bg="warning" className="ms-2">
                            Unsaved Changes
                        </Badge>
                    )}
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <i className="fas fa-spinner fa-spin fa-2x"></i>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table bordered hover>
                                <thead className="bg-light">
                                    <tr>
                                        <th style={{ width: '40%' }}>Module</th>
                                        <th className="text-center" style={{ width: '20%' }}>View</th>
                                        <th className="text-center" style={{ width: '20%' }}>Edit</th>
                                        <th className="text-center" style={{ width: '20%' }}>Denied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(permissionLabels).map(([key, label]) => (
                                        <tr key={key}>
                                            <td>{label}</td>
                                            <td className="text-center">
                                                <Form.Check
                                                    type="radio"
                                                    name={`${key}-permission`}
                                                    checked={permissions[key] === 'view'}
                                                    onChange={() => handlePermissionChange(key, 'view')}
                                                    inline
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Form.Check
                                                    type="radio"
                                                    name={`${key}-permission`}
                                                    checked={permissions[key] === 'edit'}
                                                    onChange={() => handlePermissionChange(key, 'edit')}
                                                    inline
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Form.Check
                                                    type="radio"
                                                    name={`${key}-permission`}
                                                    checked={permissions[key] === 'denied'}
                                                    onChange={() => handlePermissionChange(key, 'denied')}
                                                    inline
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowUserModal(false)}
                        disabled={savingPermissions}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={savePermissions}
                        disabled={!unsavedChanges || savingPermissions}
                    >
                        {savingPermissions ? (
                            <>
                                <i className="fas fa-spinner fa-spin me-2"></i>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Manage Control</title>
            </Helmet>
            <AdminNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    transition: 'margin-left 0.3s',
                    flexGrow: 1,
                    marginTop: '3.5rem'
                }}>
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <i className="fas fa-shield-alt me-2"></i>
                                        <strong>Role-Based Access Control</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                                    <div className="role-selector d-flex gap-3">
                                        {[
                                            { role: 'Governor', icon: 'fa-user-shield', color: '#4e73df', description: 'Manage governor accounts' },
                                            { role: 'Treasurer', icon: 'fa-user-tie', color: '#1cc88a', description: 'Manage treasurer accounts' },
                                            { role: 'Officer', icon: 'fa-user', color: '#f6c23e', description: 'Manage officer accounts' }
                                        ].map(({ role, icon, color, description }) => (
                                            <OverlayTrigger
                                                key={role}
                                                placement="top"
                                                overlay={
                                                    <Tooltip id={`tooltip-${role}`}>
                                                        {description}
                                                    </Tooltip>
                                                }
                                            >
                                                <div
                                                    onClick={() => setSelectedRole(role)}
                                                    className={`role-card ${selectedRole === role ? 'active' : ''}`}
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '0.75rem 1.5rem',
                                                        borderRadius: '0.5rem',
                                                        backgroundColor: selectedRole === role ? color : 'white',
                                                        border: `1px solid ${selectedRole === role ? color : '#e3e6f0'}`,
                                                        transition: 'all 0.3s ease',
                                                        minWidth: '160px',
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            className="icon-circle"
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '50%',
                                                                backgroundColor: selectedRole === role ? 'rgba(255, 255, 255, 0.2)' : `${color}20`,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <i className={`fas ${icon}`} style={{
                                                                color: selectedRole === role ? 'white' : color
                                                            }}></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0" style={{
                                                                color: selectedRole === role ? 'white' : '#5a5c69',
                                                                fontWeight: '600'
                                                            }}>
                                                                {role}s
                                                            </h6>
                                                            <small style={{
                                                                color: selectedRole === role ? 'rgba(255, 255, 255, 0.8)' : '#858796',
                                                                fontSize: '0.75rem'
                                                            }}>
                                                                {users[role]?.length || 0} members
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </OverlayTrigger>
                                        ))}
                                    </div>
                                    <div className="search-box position-relative">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                paddingRight: '40px',
                                                width: '300px',
                                                height: '38px',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <i className="fas fa-search position-absolute" style={{
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'orange'
                                        }}></i>
                                    </div>
                                </div>

                                <Table hover responsive className="align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: '35%', paddingLeft: '2rem' }}>Name</th>
                                            <th style={{ width: '30%' }}>Email</th>
                                            <th style={{ width: '15%' }}>ID</th>
                                            <th style={{ width: '20%' }} className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.map(user => (
                                            <tr key={user.id}>
                                                <td style={{ width: '35%', paddingLeft: '2rem' }}>
                                                    <div className="d-flex align-items-center">
                                                        <div className="role-icon me-3">
                                                            <i className="fas fa-user-circle text-primary"></i>
                                                        </div>
                                                        <div>
                                                            <h6 className="mb-0">{user.name}</h6>
                                                            <small className="text-muted">{user.position}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ width: '30%' }}>{user.email}</td>
                                                <td style={{ width: '15%' }}>{user.id}</td>
                                                <td style={{ width: '20%' }} className="text-center">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => handleUserClick(user)}
                                                        className="px-3"
                                                    >
                                                        <i className="fas fa-cog me-2" style={{ color: 'orange' }}></i>
                                                        Manage Access
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                <div className="d-flex justify-content-between align-items-center mb-2 mt-3" 
                                     style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                    <div>
                                        Showing {Math.min(currentUsers.length, usersPerPage)} of {filteredUsers.length} entries
                                    </div>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className="page-item">
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            {[...Array(totalPages)].map((_, idx) => (
                                                <li key={idx} 
                                                    className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => setCurrentPage(idx + 1)}
                                                        style={currentPage === idx + 1 ? 
                                                            { backgroundColor: 'orange', borderColor: 'orange', color: 'white' } 
                                                            : {color: 'black'}
                                                        }
                                                    >
                                                        {idx + 1}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className="page-item">
                                                <button
                                                    className="page-link"
                                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <UserDetailsModal />
        </div>
    );
};

export default ManageControls;