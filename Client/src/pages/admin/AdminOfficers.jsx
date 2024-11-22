// src/pages/admin/AdminOfficers.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';

const StatusTag = ({ status, onClick }) => {
    let className = status === 'Active' ? 'badge active-status' : 'badge archived-status';
    return (
        <span
            className={className}
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
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/officials/${officialId}/archive?type=${type}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage(`${officialName} has been archived successfully`);
            fetchOfficers();
        } catch (error) {
            setError('Failed to archive official. Please try again.');
        }
    };

    const handleUnarchive = async (officialId, officialName, type) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/officials/${officialId}/unarchive?type=${type}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage(`${officialName} has been unarchived successfully`);
            fetchOfficers();
        } catch (error) {
            setError('Failed to unarchive official. Please try again.');
        }
    };

    // Filter and search functionality
    const filteredOfficers = officers.filter(officer => {
        // Convert all searchable fields to lowercase for case-insensitive search
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
        return matchesSearch &&
            (statusFilter === "Active" ? !officer.isArchived : officer.isArchived);
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
                                        <i className="fa fa-users me-2"></i> <strong>Officers</strong>
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
                                        <Link to="/admin/officers/add-new" className="btn system-button me-2">
                                            <i className="far fa-plus me-1"></i> Add
                                        </Link>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setStatusFilter("Archived")}
                                            style={{ backgroundColor: '#FF8C00', color: 'white', border: 'none' }}
                                        >
                                            <i className="fas fa-archive me-1"></i>
                                            Show Archived
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
                                        <div className="input-group" style={{ width: 'auto', position: 'relative' }}>
                                            <span className="input-group-text" style={{ backgroundColor: 'transparent', border: 'none', position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                                <i className="fas fa-search" style={{ color: '#6c757d' }}></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by ID, name, position, or type..."
                                                value={searchTerm}
                                                onChange={handleSearchChange}
                                                aria-label="Search officers"
                                                style={{
                                                    paddingLeft: '40px',
                                                    borderRadius: '5px',
                                                    border: '1px solid #ced4da',
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                    width: '250px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Table section */}
                                {loading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : (
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
                                            {currentItems.map((officer, index) => (
                                                <tr key={officer._id}>
                                                    <td>{index + indexOfFirstItem + 1}</td>
                                                    <td>{officer.ID}</td>
                                                    <td>{officer.name}</td>
                                                    <td>{officer.position}</td>
                                                    <td>{officer.type}</td>
                                                    <td>
                                                        <StatusTag
                                                            status={officer.isArchived ? 'Archived' : 'Active'}
                                                            onClick={() => {
                                                                if (officer.isArchived) {
                                                                    handleUnarchive(officer._id, officer.name, officer.type);
                                                                } else {
                                                                    handleArchive(officer._id, officer.name, officer.type);
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
                                                                    handleUnarchive(officer._id, officer.name, officer.type);
                                                                } else {
                                                                    handleArchive(officer._id, officer.name, officer.type);
                                                                }
                                                            }}
                                                        >
                                                            <i className={`fas fa-${officer.isArchived ? 'box-open' : 'archive'}`}></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* SHOWING OF ENTRIES AND PAGINATION */}
                                <div className="d-flex justify-content-between align-items-center mb-2" style={{ color: '#6C757D', fontSize: '0.875rem' }}>
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
                                            {Array.from({ length: totalPages }, (_, index) => (
                                                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => paginate(index + 1)}
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

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminOfficers;