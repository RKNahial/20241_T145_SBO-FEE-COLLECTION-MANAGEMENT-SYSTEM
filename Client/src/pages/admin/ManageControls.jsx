// src/pages/admin/ManageControls.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useMemo } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import '../../assets/css/manage-control.css';
import { Card, Table, Button, Modal, Form, Badge, OverlayTrigger, Tooltip, Pagination } from 'react-bootstrap';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner'; 

const ManageControls = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selectedRole, setSelectedRole] = useState('Governor');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState({ Governor: [], Treasurer: [], Officer: [] });
    const usersPerPage = 5;
    const [loading, setLoading] = useState(true);
    const [savingPermissions, setSavingPermissions] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    const [showNotification, setShowNotification] = useState(false);
    
    const handlePermissionUpdateSuccess = () => {
        setShowUserModal(false);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000); 
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/officials', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = response.data.data;
                
                // Updated filtering to use isArchived
                const groupedUsers = {
                    Governor: data.filter(user => {
                        const isGovernor = user.position?.toLowerCase().trim() === 'governor'.trim();
                        const isNotArchived = user.isArchived === false;
                        return isGovernor && isNotArchived;
                    }),
                    Treasurer: data.filter(user => {
                        const isTreasurer = user.position?.toLowerCase().trim() === 'treasurer'.trim();
                        const isNotArchived = user.isArchived === false;
                        return isTreasurer && isNotArchived;
                    }),
                    Officer: data.filter(user => {
                        const isOfficer = user.position?.toLowerCase().trim() === 'officer'.trim();
                        const isNotArchived = user.isArchived === false;
                        return isOfficer && isNotArchived;
                    })
                };
                
                setUsers(groupedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
    
        fetchUsers();
    }, [currentPage]);
    
    const filteredUsers = useMemo(() => {
        const roleUsers = users[selectedRole] || [];
        
        return roleUsers.filter(user => {
            const matchesSearch = (
                (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            const matchesPosition = user.position?.toLowerCase().trim() === selectedRole.toLowerCase().trim();
            const isNotArchived = user.isArchived === false;
            
            return matchesSearch && matchesPosition && isNotArchived;
        });
    }, [users, selectedRole, searchTerm]);

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
        const [hoverSave, setHoverSave] = useState(false);
        const [hoverCancel, setHoverCancel] = useState(false);
        const [error, setError] = useState(null);

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
                        setLoading(true);
                        setError(null);
                        const token = localStorage.getItem('token');
                        const response = await axios.get(
                            `http://localhost:8000/api/permissions/${selectedUser._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        // If no permissions found, use default permissions
                        const userPermissions = response.data.data?.permissions || permissions;
                        setPermissions(userPermissions);
                    } catch (error) {
                        console.error('Error fetching permissions:', error);
                        setError('Failed to load permissions. Please try again.');
                    } finally {
                        setLoading(false);
                    }
                }
            };
            fetchPermissions();
        }, [selectedUser]);

        const handlePermissionChange = (module, value) => {
            setPermissions(prevPermissions => ({
                ...prevPermissions,
                [module]: value
            }));
            setUnsavedChanges(true);
        };

        const savePermissions = async () => {
            try {
                setSavingPermissions(true);
                setError(null);
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
                handlePermissionUpdateSuccess();
            } catch (error) {
                console.error('Error updating permissions:', error);
                setError('Failed to save permissions. Please try again.');
            } finally {
                setSavingPermissions(false);
            }
        };

        return (
            <Modal 
                show={showUserModal} 
                onHide={() => setShowUserModal(false)} 
                size="lg"
                backdrop="static"
            >
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title style={{ fontSize: '1.2rem'}}>
                        <i className="fas fa-user-shield me-2"></i>
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
                            <LoadingSpinner 
                                text="Loading Access Permissions" 
                                icon="access"
                                subtext={`Loading permissions for ${selectedUser?.name}`}
                            />
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger" role="alert">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
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
                <Modal.Footer style={{ border: 'none', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={savePermissions}
                            disabled={!unsavedChanges || savingPermissions}
                            style={{
                                borderRadius: '0.35rem',
                                color: '#EAEAEA',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                backgroundColor: hoverSave ? '#E67E22' : '#FF8C00',
                                opacity: (!unsavedChanges || savingPermissions) ? 0.65 : 1
                            }}
                            onMouseEnter={() => setHoverSave(true)}
                            onMouseLeave={() => setHoverSave(false)}
                        >
                            {savingPermissions ? (
                                <>
                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowUserModal(false)}
                            disabled={savingPermissions}
                            style={{
                                borderRadius: '0.35rem',
                                color: '#EAEAEA',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                backgroundColor: hoverCancel ? '#cc0000' : 'red',
                                opacity: savingPermissions ? 0.65 : 1
                            }}
                            onMouseEnter={() => setHoverCancel(true)}
                            onMouseLeave={() => setHoverCancel(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        );
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const roleColors = {
        Governor: '#4e73df',
        Treasurer: '#1cc88a',
        Officer: '#f6b100' 
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Manage Controls</title>
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
                                        <strong>Manage Controls</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Notification */}
                            {showNotification && (
                                <div className="alert alert-success alert-dismissible fade show mx-4 mt-3" 
                                    role="alert"
                                    style={{
                                        animation: 'fadeIn 0.5s',
                                        borderRadius: '0.5rem',
                                        backgroundColor: '#d1e7dd',
                                        border: '1px solid #badbcc',
                                        color: '#0f5132'
                                    }}>
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-check-circle me-2"></i>
                                        User Access Updated Successfully
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setShowNotification(false)}
                                        style={{ padding: '1.05rem' }}
                                    />
                                </div>
                            )}

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
                                    <div className="input-group d-flex search-bar" style={{ width: 'auto', position: 'relative' }}>
                                            <input
                                                type="text"
                                                className="search-input me-2"
                                            placeholder="Search users"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                          <button type="submit" className="search btn btn-sm">
                                                    <i className="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Table */}
                                <div className="table-shadow">
                                    <Table hover responsive className="align-middle mb-0">
                                        <thead className="bg-light">
                                            <tr>
                                                <th style={{ width: '35%', paddingLeft: '2rem' }}>Name</th>
                                                <th style={{ width: '30%' }}>Email</th>
                                                <th style={{ width: '15%' }}>ID</th>
                                                <th style={{ width: '20%' }} className="text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentUsers.map(user => ( 
                                                <tr key={user.id}>
                                                    <td style={{ width: '35%', paddingLeft: '2rem' }}>
                                                        <div className="d-flex align-items-center">
                                                            <div className="role-icon me-3">
                                                                <i className="fas fa-user-circle" style={{ 
                                                                    color: roleColors[selectedRole] || '#4e73df' 
                                                                }}></i>
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
                                                        style={{
                                                            borderColor: roleColors[selectedRole] || '#4e73df',
                                                            color: roleColors[selectedRole] || '#4e73df',
                                                            // Add hover and active states
                                                            ':hover': {
                                                                backgroundColor: roleColors[selectedRole] || '#4e73df',
                                                                borderColor: roleColors[selectedRole] || '#4e73df',
                                                                color: 'white'
                                                            },
                                                            ':active': {
                                                                backgroundColor: roleColors[selectedRole] || '#4e73df',
                                                                borderColor: roleColors[selectedRole] || '#4e73df',
                                                                color: 'white'
                                                            }
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.backgroundColor = roleColors[selectedRole];
                                                            e.currentTarget.style.color = 'white';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                            e.currentTarget.style.color = roleColors[selectedRole];
                                                        }}
                                                    >
                                                        <i className="fas fa-cog me-2" style={{ 
                                                            color: 'inherit'  
                                                        }}></i>
                                                        Manage Access
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    </Table>
                                </div>

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
                                                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
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
                                                        onClick={() => handlePageChange(idx + 1)}
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
                                                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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