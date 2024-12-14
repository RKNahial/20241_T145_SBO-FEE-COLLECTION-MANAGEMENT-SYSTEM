// src/pages/admin/AdminOfficers.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Modal, Button } from 'react-bootstrap';

const StatusTag = ({ status, onClick }) => {
    const isActive = status === 'Active';
    return (
        <span
            className={`badge ${isActive ? 'active-status' : 'archived-status'}`}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            {status}
        </span>
    );
};

const AdminOfficers = () => {
    // State management
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Active");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [archivingId, setArchivingId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState({ type: '', officer: null });

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Fetch officers
    const fetchOfficers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/officials', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOfficers(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching officials:', error);
            setError('Failed to fetch officials. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOfficers();
    }, []);

    // Handle archive/unarchive
    const handleArchive = async (officialId, officialName, type) => {
        try {
            setArchivingId(officialId);
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/officials/${officialId}/archive?type=${type}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage(`${officialName} has been archived successfully`);
            fetchOfficers();

            // Auto-dismiss success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

        } catch (error) {
            setError('Failed to archive official. Please try again.');
        } finally {
            setArchivingId(null);
        }
    };

    const handleUnarchive = async (officialId, officialName, type) => {
        try {
            setArchivingId(officialId);
            const token = localStorage.getItem('token');
            
            // Modified request
            const response = await axios.put(
                `http://localhost:8000/api/officials/${officialId}/unarchive?type=${type}`, 
                {}, // Empty body since we're not sending any data
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
    
            if (response.data.success) {
                setSuccessMessage(`${officialName} has been unarchived successfully`);
                await fetchOfficers();
            } else {
                throw new Error('Failed to unarchive official');
            }
    
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
    
        } catch (error) {
            console.error('Unarchive error:', error);
            setError('Failed to unarchive official. Please try again.');
        } finally {
            setArchivingId(null);
        }
    };

    const confirmAction = async () => {
        if (modalAction.type === 'archive') {
            await handleArchive(modalAction.officer._id, modalAction.officer.name, modalAction.officer.type);
        } else {
            await handleUnarchive(modalAction.officer._id, modalAction.officer.name, modalAction.officer.type);
        }
        setShowModal(false);
    };

    // Filter and search functionality
    const filteredOfficers = officers.filter(officer => {
        const searchableFields = [
            officer.ID?.toLowerCase() || '',
            officer.name?.toLowerCase() || '',
            officer.position?.toLowerCase() || '',
            officer.type?.toLowerCase() || '',
            officer.email?.toLowerCase() || ''
        ];

        const searchTermLower = searchTerm.toLowerCase();

        // Check if any field contains the search term
        const matchesSearch = searchableFields.some(field =>
            field.includes(searchTermLower)
        );

        // Apply status filter along with search
        if (statusFilter === "All") return matchesSearch;
        
        // Explicitly check isArchived boolean value
        const isArchived = officer.isArchived === true;
        return matchesSearch && (statusFilter === "Active" ? !isArchived : isArchived);
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOfficers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Add this sorting function after the pagination calculations
    const sortedItems = [...currentItems].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Officers</title>
            </Helmet>
            <AdminNavbar toggleSidebar={toggleSidebar} />
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
                                        <i className="fas fa-users me-2"></i> <strong>Officers</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="alert alert-success" role="alert">
                                        {successMessage}
                                    </div>
                                )}

                                {/* Your existing filters and search bar */}
                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                    <div>
                                        <Link 
                                            to="/admin/officers/add-new" 
                                            className="add-button btn btn-sm me-2" >
                                            <i className="fas fa-plus me-2"></i>
                                            Add New Officer
                                        </Link>
                                        <button
                                            className="add-button btn btn-sm me-2"
                                            onClick={() => setStatusFilter("Archived")}
                                            style={{ backgroundColor: '#FF8C00', color: 'white', border: 'none' }}
                                            >
                                                <i className="fas fa-archive me-1"></i>
                                                Archived Officers
                                            </button>
                                    </div>
                                    <div className="d-flex align-items-center" style={{ width: 'auto' }}>
                                        <select
                                            className="form-select me-2"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            style={{ width: 'auto', minWidth: '120px' }}
                                        >
                                            <option value="All">All</option>
                                            <option value="Active">Active</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                        <div className="input-group d-flex search-bar" style={{ width: 'auto', position: 'relative' }}>
                                            <input
                                                type="text"
                                                className="search-input me-2"
                                                placeholder="Search officer"
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                                aria-label="Search officers"
                                            />
                                            <button type="submit" className="search btn btn-sm">
                                                    <i className="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Table section */}
                                {loading ? (
                                    <LoadingSpinner
                                        text="Loading Officers"
                                        icon="users"
                                        subtext="Fetching officer records..."
                                    />
                                ) : error ? (
                                    <div className="alert alert-danger">
                                        <i className="fas fa-exclamation-circle me-2"></i>
                                        {error}
                                    </div>
                                ) : (
                                    <>
                                        <table className="table table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Officer ID</th>
                                                    <th>Officer Name</th>
                                                    <th>Position</th>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedItems.map((officer, index) => (
                                                    <tr key={officer._id}>
                                                        <td>{indexOfFirstItem + index + 1}</td>
                                                        <td>{officer.ID}</td>
                                                        <td>{officer.name}</td>
                                                        <td>{officer.position}</td>
                                                        <td>{officer.type}</td>
                                                        <td>
                                                            <StatusTag
                                                                status={officer.isArchived ? 'Archived' : 'Active'}
                                                                onClick={() => {
                                                                    if (officer.isArchived) {
                                                                        setModalAction({ type: 'unarchive', officer });
                                                                        setShowModal(true);
                                                                    } else {
                                                                        setModalAction({ type: 'archive', officer });
                                                                        setShowModal(true);
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Link to={`/admin/officers/edit/${officer._id}`} className="btn btn-edit btn-sm">
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <button
                                                                className={`btn btn-archive btn-sm ${officer.isArchived ? 'btn-open' : ''}`}
                                                                onClick={() => {
                                                                    if (officer.isArchived) {
                                                                        setModalAction({ type: 'unarchive', officer });
                                                                        setShowModal(true);
                                                                    } else {
                                                                        setModalAction({ type: 'archive', officer });
                                                                        setShowModal(true);
                                                                    }
                                                                }}
                                                                disabled={archivingId === officer._id}
                                                            >
                                                                {archivingId === officer._id ? (
                                                                    <div className="spinner-border spinner-border-sm"
                                                                        role="status"
                                                                        style={{
                                                                            width: '14px',
                                                                            height: '14px',
                                                                            borderWidth: '2px'
                                                                        }}
                                                                    >
                                                                        <span className="visually-hidden">Loading...</span>
                                                                    </div>
                                                                ) : (
                                                                    <i className={`fas fa-${officer.isArchived ? 'box-open' : 'archive'}`}></i>
                                                                )}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
                                        <div className="d-flex justify-content-between align-items-center mb-2 mt-3" style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                            <div>
                                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOfficers.length)} of {filteredOfficers.length} entries
                                            </div>
                                            <nav>
                                                <ul className="pagination mb-0">
                                                    <li className="page-item">
                                                        <button
                                                            className="page-link"
                                                            onClick={() => paginate(currentPage - 1)}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Previous
                                                        </button>
                                                    </li>
                                                    {[...Array(totalPages)].map((_, index) => (
                                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => paginate(index + 1)}
                                                                style={currentPage === index + 1 ? 
                                                                    { backgroundColor: 'orange', borderColor: 'orange', color: 'white' } 
                                                                    : {color: 'black'}
                                                                }
                                                            >
                                                                {index + 1}
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className="page-item">
                                                        <button
                                                            className="page-link page-label"
                                                            onClick={() => paginate(currentPage + 1)}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Next
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalAction.type === 'archive' ? 'Archive' : 'Unarchive'} Officer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to {modalAction.type} <strong>{modalAction.officer?.name}</strong>?
                    </p>
                    {modalAction.type === 'archive' && <small style={{ color: '#6c757d', fontSize: '0.90rem' }}>You can still unarchive the officer if you change your mind.</small>}
                </Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="btn btn-confirm" onClick={confirmAction} style={{ flex: 'none' }}>Confirm</Button>
                    <Button variant="btn btn-cancel" onClick={() => setShowModal(false)} style={{ marginRight: '0.5rem', flex: 'none' }}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminOfficers;