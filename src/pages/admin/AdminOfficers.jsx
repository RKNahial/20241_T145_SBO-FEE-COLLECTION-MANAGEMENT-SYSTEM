// src/pages/admin/AdminOfficers.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useRef } from "react";
import { Link } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar"; 
import AdminNavbar from "./AdminNavbar";

const AdminOfficers = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Sample data for demonstration only
    const sampleStud = [
        {
            id_no: '1901104188',
            name: 'Mary Joy Alonzo',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'Treasurer',
            status: 'Active'
        },
        {
            id_no: '2101102924',
            name: 'Jonathan Cruz',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'Governor',
            status: 'Active'
        },
        {
            id_no: '1901102046',
            name: 'Reena Dela Cruz',
            year_level: '3rd Year',
            program: 'BSIT',
            position: 'P.I.O',
            status: 'Archived'
        },
        {
            id_no: '2101101354',
            name: 'Peter John Garcia',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'Secretary',
            status: 'Active'
        },
        {
            id_no: '1901103113',
            name: 'Jessa Mae Javier',
            year_level: '2nd Year',
            program: 'BSIT',
            position: '2nd Year Representative',
            status: 'Active'
        },
        {
            id_no: '2101101979',
            name: 'Mark Anton Lim',
            year_level: '1st Year',
            program: 'BSIT',
            position: '1st Year Representative',
            status: 'Archived'
        },
        {
            id_no: '2101103848',
            name: 'Anna Marie Mendoza',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'Treasurer',
            status: 'Active'
        },            
        {
            id_no: '1901104713',
            name: 'Liza Reyes',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'Governor',
            status: 'Archived'
        },            
        {
            id_no: '1901104188',
            name: 'Samuel Santos',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'P.I.O',
            status: 'Active'
        },
        {
            id_no: '1901104235',
            name: 'Mary Joy Alonzo',
            year_level: '3rd Year',
            program: 'BSIT',
            position: '3rd Year Representative',
            status: 'Active'
        },
        {
            id_no: '1901104188',
            name: 'I AM',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'Secretary',
            status: 'Archived'
        },
        {
            id_no: '2101102924',
            name: 'ONLY TESTING',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'Governor',
            status: 'Active'
        },
        {
            id_no: '1901102046',
            name: 'IF THE PAGINATION',
            year_level: '3rd Year',
            program: 'BSIT',
            position: '3rd Year Representative',
            status: 'Archived'
        },
        {
            id_no: '2101101354',
            name: 'IS WORKING',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'P.I.O',
            status: 'Active'
        },
        {
            id_no: '1901103113',
            name: 'BLAH BLAH BLAH',
            year_level: '2nd Year',
            program: 'BSIT',
            position: '2nd Year Representative',
            status: 'Archived'
        },
        {
            id_no: '2101101979',
            name: 'PROPER NAME',
            year_level: '1st Year',
            program: 'BSIT',
            position: '1st Year Representative',
            status: 'Active'
        },
        {
            id_no: '2101103848',
            name: 'PLACE NAME',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'Secretary',
            status: 'Archived'
        },            
        {
            id_no: '1901104713',
            name: 'BACKSTORY STUFF',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'Governor',
            status: 'Active'
        },            
        {
            id_no: '1901104188',
            name: 'Samuel Santos',
            year_level: '4th Year',
            program: 'BSIT',
            position: 'P.I.O',
            status: 'Active'
        },
        {
            id_no: '1901104235',
            name: 'Mary Joy Alonzo',
            year_level: '3rd Year',
            program: 'BSIT',
            position: '3rd Year Representative',
            status: 'Archived'
        }
    ];

    // HANDLE ARCHIVE
    const [successMessage, setSuccessMessage] = useState("");
    const handleArchive = (studentName) => {
        const confirmArchive = window.confirm(`Are you sure you want to archive ${studentName}?`);
        if (confirmArchive) {
            // Perform the archive action, e.g., make an API call
            console.log(`${studentName} has been archived.`);
            setSuccessMessage(`${studentName} has been successfully archived!`);
            
            setTimeout(() => {
                setSuccessMessage("");
            }, 2500);
        }
    };

    // HANDLE UNARCHIVE
    const handleUnarchive = (studentName) => {
        const confirmUnarchive = window.confirm(`Are you sure you want to unarchive ${studentName}?`);
        if (confirmUnarchive) {
            // Perform the unarchive action, e.g., make an API call
            console.log(`${studentName} has been unarchived.`);
            setSuccessMessage(`${studentName} has been successfully unarchived!`);
            
            setTimeout(() => {
                setSuccessMessage("");
            }, 2500);
        }
    };
    

    // IMPORT EXCEL
    const fileInputRef = useRef(null);
    const handleImportClick = () => {
        fileInputRef.current.click();
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        // Handle the file upload logic here
        console.log(file);
    };

    // HANDLE GOOGLE NOTES
    const handleOpenGoogleNotes = (studentId) => {
        const noteTitle = `Notes for ${studentId}`;
        const noteContent = `Add your notes for student ${studentId} here.`;
        
        // Construct the Google Keep URL
        const googleKeepUrl = `https://keep.google.com/#NOTE&title=${encodeURIComponent(noteTitle)}&text=${encodeURIComponent(noteContent)}`;
    
        // Open in a new tab
        window.open(googleKeepUrl, '_blank');
    };

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sampleStud.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sampleStud.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const showingStart = indexOfFirstItem + 1;
    const showingEnd = Math.min(indexOfLastItem, sampleStud.length);
    const totalEntries = sampleStud.length;

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Students</title>
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
                                        <i className="fa fa-users me-2"></i> <strong>Officers</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                {successMessage && (  
                                        <div className="alert alert-success" role="alert">
                                            {successMessage}
                                        </div>
                                    )}
                                {/* ADD NEW OFFICER*/}
                                <div className="d-flex justify-content-between mb-3 align-items-center">
                                    <div className="d-flex me-auto">
                                        <Link to="/admin/officers/add-new" className="add-button btn btn-sm me-2">
                                            <i className="fas fa-plus me-2"></i>
                                            Add New Officer
                                        </Link>
                                    </div>
                                    <div className="d-flex align-items-center me-3"> 
                                        <label className="me-2 mb-0">Officer Status</label>
                                        <div className="dashboard-select" style={{ width: 'auto' }}>
                                            <select className="form-control" defaultValue="">
                                                <option value="" disabled>Select status</option>
                                                <option value="Active">Active</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>
                                    <form method="get" className="search-bar ">
                                        <input type="text" placeholder="Search officer" className="search-input" />
                                        <button type="submit" className="search">
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </form>
                                </div>

                                {/* TABLE OFFICERS*/}
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
                                        {currentItems.map((student, index) => (
                                            <tr key={student.id_no}>
                                                <td>{index + indexOfFirstItem + 1}</td> 
                                                <td>{student.id_no}</td>
                                                <td>{student.name}</td>
                                                <td>{student.position}</td>
                                                <td>{student.status}</td>
                                                <td>
                                                    <Link to={`/admin/officers/edit/${student.id_no}`} className="btn btn-edit btn-sm">
                                                        <i className="fas fa-edit"></i>
                                                    </Link>
                                                    <button 
                                                        className={`btn btn-archive btn-sm ${student.status === 'Archived' ? 'btn-open' : ''}`} 
                                                        onClick={() => {
                                                            if (student.status === 'Active') {
                                                                handleArchive(student.name);
                                                            } else {
                                                                // Handle unarchive action
                                                                handleUnarchive(student.name);
                                                                // Update student status logic here if necessary
                                                            }
                                                        }}
                                                    >
                                                        <i className={`fas fa-${student.status === 'Active' ? 'archive' : 'box-open'}`}></i>
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

export default AdminOfficers;