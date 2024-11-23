// src/pages/admin/AdminAdminsjsx
import { Helmet } from 'react-helmet';
import React, { useState, useRef, useEffect } from "react";
import { Link } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminAdmins = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Active");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch admins
    const fetchAdmins = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/admins', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmins(response.data.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch admins');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    // Handle archive/unarchive
    const handleArchive = async (adminId, adminName) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/admins/${adminId}/archive`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage(`${adminName} has been archived successfully`);
            fetchAdmins();
        } catch (error) {
            setError('Failed to archive admin');
        }
    };

    const handleUnarchive = async (adminId, adminName) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8000/api/admins/${adminId}/unarchive`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccessMessage(`${adminName} has been unarchived successfully`);
            fetchAdmins();
        } catch (error) {
            setError('Failed to unarchive admin');
        }
    };

    // Filter and search functionality
    const filteredAdmins = admins.filter(admin => {
        const searchableFields = [
            admin.ID?.toLowerCase() || '',
            admin.name?.toLowerCase() || '',
            admin.email?.toLowerCase() || '',
            admin.position?.toLowerCase() || ''
        ];

        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = searchableFields.some(field =>
            field.includes(searchTermLower)
        );

        if (statusFilter === "All") return matchesSearch;
        return matchesSearch &&
            (statusFilter === "Active" ? !admin.isArchived : admin.isArchived);
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAdmins.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Add this sorting function after the pagination calculations
    const sortedItems = [...currentItems].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Administrators</title>
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
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <i className="fa fa-user-cog me-2"></i> <strong>Admin</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                {successMessage && (
                                    <div className="alert alert-success" role="alert">
                                        {successMessage}
                                    </div>
                                )}

                                {/* Filters and Add button section */}
                                <div className="d-flex justify-content-between mb-3 align-items-center">
                                    <div>
                                        <Link to="/admin/admins/add-new" className="btn system-button me-2">
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
                                                placeholder="Search admin..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                aria-label="Search admin"
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

                                {/* Replace the table section with this conditional rendering */}
                                {loading ? (
                                    <LoadingSpinner
                                        text="Loading Administrators"
                                        icon="user-shield"
                                        subtext="Fetching administrator records..."
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
                                                    <th>Admin Name</th>
                                                    <th>Employee ID</th>
                                                    <th>Email</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedItems.map((admin, index) => (
                                                    <tr key={admin._id}>
                                                        <td>{indexOfFirstItem + index + 1}</td>
                                                        <td>{admin.name}</td>
                                                        <td>{admin.ID}</td>
                                                        <td>{admin.email}</td>
                                                        <td>
                                                            <span className={`badge ${admin.isArchived ? 'archived-status' : 'active-status'}`}>
                                                                {admin.isArchived ? 'Archived' : 'Active'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <Link to={`/admin/admins/edit/${admin._id}`} className="btn btn-edit btn-sm">
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <button
                                                                className={`btn btn-archive btn-sm ${admin.isArchived ? 'btn-open' : ''}`}
                                                                onClick={() => admin.isArchived ?
                                                                    handleUnarchive(admin._id, admin.name) :
                                                                    handleArchive(admin._id, admin.name)}
                                                            >
                                                                <i className={`fas fa-${admin.isArchived ? 'box-open' : 'archive'}`}></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Pagination section */}
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {filteredAdmins.length} entries
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

export default AdminAdmins;