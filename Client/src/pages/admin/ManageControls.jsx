import React, { useState, useEffect } from 'react';
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

                const groupedUsers = {
                    Governor: data.filter(user => user.position.toLowerCase() === 'governor'),
                    Treasurer: data.filter(user => user.position.toLowerCase() === 'treasurer'),
                    Officer: data.filter(user => user.position.toLowerCase() === 'officer')
                };

                setUsers(groupedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on selected role and search term
    const filteredUsers = users[selectedRole]?.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const currentUsers = filteredUsers.slice(
        (currentPage - 1) * usersPerPage,
        currentPage * usersPerPage
    );

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
        return (
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-user-cog me-2 text-primary"></i>
                        Manage User Access
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <div>
                            <div className="d-flex align-items-center mb-4">
                                <div className="role-icon me-3">
                                    <i className="fas fa-user-circle text-primary"></i>
                                </div>
                                <div>
                                    <h5 className="mb-1">{selectedUser.name}</h5>
                                    <p className="text-muted mb-0">{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="border rounded p-3 mb-3">
                                <h6 className="mb-3">Access Permissions</h6>
                                <Table bordered>
                                    <thead className="bg-light">
                                        <tr>
                                            <th style={{ width: '200px' }}>Module</th>
                                            <th className="text-center">View</th>
                                            <th className="text-center">Edit</th>
                                            <th className="text-center">Denied</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            'Add Student',
                                            'Add Payment Category',
                                            'Update Student',
                                            'Update Payment Category',
                                            'Archive Student',
                                            'Unarchive Student',
                                            'Toggle Dues Payment',
                                            'Dues Payment',
                                            'Payment Update',
                                            'Archive Category',
                                            'Unarchive Category',
                                            'Email Notifications'
                                        ].map(module => (
                                            <tr key={module}>
                                                <td>{module}</td>
                                                <td className="text-center">
                                                    <Form.Check type="radio" name={module} />
                                                </td>
                                                <td className="text-center">
                                                    <Form.Check type="radio" name={module} />
                                                </td>
                                                <td className="text-center">
                                                    <Form.Check type="radio" name={module} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        );
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    return (
        <div className="sb-nav-fixed">
            <AdminNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
            <div style={{ display: 'flex', height: '100vh' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    transition: 'margin-left 0.3s',
                    marginTop: '3.5rem',
                    padding: '1.5rem',
                    width: '100%',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div className="container-fluid px-0">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="mb-0">
                                <i className="fas fa-shield-alt me-2 text-primary"></i>
                                Role-Based Access Control
                            </h2>
                        </div>

                        <Card className="shadow-sm">
                            <Card.Header className="bg-white py-3">
                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                    <div className="btn-group">
                                        {['Governor', 'Treasurer', 'Officer'].map(role => (
                                            <Button
                                                key={role}
                                                variant={selectedRole === role ? 'primary' : 'outline-primary'}
                                                onClick={() => setSelectedRole(role)}
                                                className="d-flex align-items-center px-4"
                                                style={{ minWidth: '140px' }}
                                            >
                                                <i className={`fas ${role === 'Governor' ? 'fa-user-shield' :
                                                    role === 'Treasurer' ? 'fa-user-tie' :
                                                        'fa-user'
                                                    } me-2`}></i>
                                                {role}s
                                            </Button>
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
                                                paddingLeft: '40px',
                                                width: '300px',
                                                height: '38px'
                                            }}
                                        />
                                        <i className="fas fa-search position-absolute" style={{
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#6c757d'
                                        }}></i>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
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
                                                            <small className="text-muted">{selectedRole}</small>
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
                                                        <i className="fas fa-cog me-2"></i>
                                                        Manage Access
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <div className="p-3 border-top">
                                    <PaginationControls />
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
            <UserDetailsModal />
        </div>
    );
};

export default ManageControls;