// src/pages/Gov/GovOfficers.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import GovSidebar from "./GovSidebar"; 
import GovNavbar from "./GovNavbar";
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

// Status Tag Component
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

const GovOfficers = () => {
    // State management
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Active");
    const [currentPage, setCurrentPage] = useState(1);
    const [showArchived, setShowArchived] = useState(false);
    const itemsPerPage = 10;
    const [archivingId, setArchivingId] = useState(null);

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
            setTimeout(() => setSuccessMessage(''), 3000);
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
            await axios.put(`http://localhost:8000/api/officials/${officialId}/unarchive?type=${type}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage(`${officialName} has been unarchived successfully`);
            fetchOfficers();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setError('Failed to unarchive official. Please try again.');
        } finally {
            setArchivingId(null);
        }
    };

    // Filter and search functionality
    const filteredOfficers = officers.filter(officer => {
        const searchableFields = [
            officer.ID?.toLowerCase() || '',
            officer.name?.toLowerCase() || '',
            officer.position?.toLowerCase() || '',
            officer.email?.toLowerCase() || ''
        ];

        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchableFields.some(field =>
            field.includes(searchTermLower)
        );

        if (statusFilter === "All") return matchesSearch;
        return matchesSearch &&
            (statusFilter === "Active" ? !officer.isArchived : officer.isArchived);
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOfficers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Sort items by name
    const sortedItems = [...currentItems].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | Officers</title>
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
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <i className="fa fa-users me-2" style={{ color: '#FF8C00' }}></i> <strong>Officers</strong>
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

                                {/* ADD NEW OFFICER*/}
                                <div className="d-flex justify-content-between mb-3 align-items-center">
                                    <div className="d-flex me-auto">
                                        <Link to="/governor/officers/add-new" className="add-button btn btn-sm me-2">
                                            <i className="fas fa-plus me-2"></i>
                                            Add New Officer
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                setShowArchived(!showArchived);
                                                setStatusFilter(showArchived ? "Active" : "Archived");
                                            }}
                                            className="btn btn-sm me-2"
                                            style={{
                                                backgroundColor: '#FF8C00',
                                                color: 'white',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <i className={`fas fa-${showArchived ? 'box-open' : 'box-archive'}`}></i>
                                            {showArchived ? 'Show Active' : 'Show Archived'}
                                        </button>
                                    </div>
                                    <div className="d-flex align-items-center me-3"> 
                                        <label className="me-2 mb-0">Officer Status</label>
                                        <div className="dashboard-select" style={{ width: 'auto' }}>
                                            <select 
                                                className="form-control" 
                                                value={statusFilter}
                                                onChange={(e) => {
                                                    setStatusFilter(e.target.value);
                                                    setShowArchived(e.target.value === "Archived");
                                                }}
                                            >
                                                <option value="All">All</option>
                                                <option value="Active">Active</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="position-relative">
                                        <input 
                                            type="text" 
                                            placeholder="Search officer" 
                                            className="form-control form-control-sm pe-4" 
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            style={{ width: '200px' }}
                                        />
                                        <i 
                                            className="fas fa-search position-absolute" 
                                            style={{ 
                                                top: '50%', 
                                                right: '10px', 
                                                transform: 'translateY(-50%)',
                                                color: '#FF8C00',
                                                pointerEvents: 'none'
                                            }}
                                        ></i>
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
                                                            <div className="btn-group">
                                                                <Link
                                                                    to={`/governor/officers/edit/${officer._id}`}
                                                                    className="btn btn-edit btn-sm"
                                                                >
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
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
                                        <div className="d-flex justify-content-between align-items-center mt-3" 
                                            style={{ 
                                                paddingLeft: '1rem', 
                                                paddingRight: '1rem'
                                            }}
                                        >
                                            <div style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOfficers.length)} of {filteredOfficers.length} entries
                                            </div>
                                            <nav>
                                                <ul className="pagination">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            className="page-link"
                                                            disabled={currentPage === 1}
                                                            style={{ color: '#6C757D' }}
                                                        >
                                                            Previous
                                                        </button>
                                                    </li>
                                                    {[...Array(totalPages)].map((_, index) => (
                                                        <li 
                                                            key={index} 
                                                            className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}
                                                        >
                                                            <button
                                                                onClick={() => setCurrentPage(index + 1)}
                                                                className="page-link"
                                                                style={index + 1 === currentPage ? {
                                                                    backgroundColor: '#FF8C00',
                                                                    borderColor: '#FF8C00',
                                                                    color: '#EAEAEA'
                                                                } : {
                                                                    color: '#6C757D'
                                                                }}
                                                            >
                                                                {index + 1}
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                            className="page-link"
                                                            disabled={currentPage === totalPages}
                                                            style={{ color: '#6C757D' }}
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
        </div>
    );
};

export default GovOfficers;