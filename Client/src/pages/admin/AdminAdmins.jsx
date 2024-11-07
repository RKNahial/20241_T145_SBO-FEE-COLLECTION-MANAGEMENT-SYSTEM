// src/pages/admin/AdminAdminsjsx
import { Helmet } from 'react-helmet';
import React, { useState, useRef } from "react";
import { Link } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar"; 
import AdminNavbar from "./AdminNavbar";

const AdminAdmins = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const [adminData, setAdminData] = useState([
        {
            name: 'John Doe',
            employee_id: 'A123456',
            email: 'john.doe@buksu.edu.ph',
            status: 'Active'
        },
        {
            name: 'Jane Smith',
            employee_id: 'A789012',
            email: 'jane.smith@buksu.edu.ph',
            status: 'Active'
        }
    ]);

    const [successMessage, setSuccessMessage] = useState("");

    // HANDLE ARCHIVE
    const handleArchiveAdmin = (employeeId) => {
        const admin = adminData.find((admin) => admin.employee_id === employeeId);
        if (admin && admin.status === 'Active') {
            const confirmArchive = window.confirm(`Are you sure you want to archive ${admin.name}?`);
            if (confirmArchive) {
                // Update the status to "Archived"
                const updatedAdmins = adminData.map((admin) =>
                    admin.employee_id === employeeId
                        ? { ...admin, status: 'Archived' }
                        : admin
                );
                setAdminData(updatedAdmins); // This will update adminData state
                setSuccessMessage(`${admin.name} has been successfully archived!`);
                setTimeout(() => setSuccessMessage(""), 2500); // Clear the success message after 2.5 seconds
            }
        }
    };

    // HANDLE UNARCHIVE
    const handleUnarchiveAdmin = (employeeId) => {
        const admin = adminData.find((admin) => admin.employee_id === employeeId);
        if (admin && admin.status === 'Archived') {
            const confirmUnarchive = window.confirm(`Are you sure you want to unarchive ${admin.name}?`);
            if (confirmUnarchive) {
                // Update the status to "Active"
                const updatedAdmins = adminData.map((admin) =>
                    admin.employee_id === employeeId
                        ? { ...admin, status: 'Active' }
                        : admin
                );
                setAdminData(updatedAdmins); // This will update adminData state
                setSuccessMessage(`${admin.name} has been successfully unarchived!`);
                setTimeout(() => setSuccessMessage(""), 2500); // Clear the success message after 2.5 seconds
            }
        }
    };


    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = adminData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(adminData.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const showingStart = indexOfFirstItem + 1;
    const showingEnd = Math.min(indexOfLastItem, adminData.length);
    const totalEntries = adminData.length;

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Students</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
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
                     {/* CONTENT */}
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
                                {/* ADD NEW ADMIN*/}
                                <div className="d-flex justify-content-between mb-3 align-items-center">
                                    <div className="d-flex me-auto"> 
                                        <Link to="/admin/admins/add-new" className="add-button btn btn-sm me-2">
                                            <i className="fas fa-plus me-2"></i>
                                            Add New Admin
                                        </Link>
                                    </div>
                                    <div className="d-flex align-items-center me-3"> 
                                        <label className="me-2 mb-0">Admin Status</label>
                                        <div className="dashboard-select" style={{ width: 'auto' }}>
                                            <select className="form-control" defaultValue="">
                                                <option value="" disabled>Select status</option>
                                                <option value="Active">Active</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>
                                    <form method="get" className="d-flex search-bar">
                                        <input type="text" placeholder="Search admin" className="search-input me-2" />
                                        <button type="submit" className="search btn btn-sm">
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </form>
                                </div>

                              {/* TABLE ADMINS */}
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
                                        {adminData.map((admin, index) => (
                                            <tr key={admin.employee_id}>
                                                <td>{index + 1}</td> 
                                                <td>{admin.name}</td>
                                                <td>{admin.employee_id}</td>
                                                <td>{admin.email}</td>
                                                <td>{admin.status}</td> 
                                                <td>
                                                    {/* Edit Button */}
                                                    <Link to={`/admin/admins/edit/${admin.employee_id}`} className="btn btn-edit btn-sm">
                                                        <i className="fas fa-edit"></i>
                                                    </Link>
                                                    
                                                    {/* Archive Button */}
                                                    <button 
                                                        className="btn btn-archive btn-sm" 
                                                        onClick={() => handleArchiveAdmin(admin.employee_id)}
                                                    >
                                                        <i className="fas fa-archive"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* SHOWING OF ENTRIES AND PAGINATION */}
                                <div className="d-flex justify-content-between align-items-center mb-2" style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                    <div>
                                        Showing {showingStart} to {showingEnd} of {totalEntries} entries
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

export default AdminAdmins;