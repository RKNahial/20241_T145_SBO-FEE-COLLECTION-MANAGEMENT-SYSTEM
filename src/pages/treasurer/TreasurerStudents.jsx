// src/pages/treasurer/TreasurerStudents.jsx
import React, { useState } from "react";
import axios from 'axios'; 
import TreasurerSidebar from "./TreasurerSidebar"; 
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerStudents = () => {
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
                program: 'BSIT'
            },
            {
                id_no: '2101102924',
                name: 'Jonathan Cruz',
                year_level: '4th Year',
                program: 'BSIT'
            },
            {
                id_no: '1901102046',
                name: 'Reena Dela Cruz',
                year_level: '3rd Year',
                program: 'BSIT'
            },
            {
                id_no: '2101101354',
                name: 'Peter John Garcia',
                year_level: '4th Year',
                program: 'BSIT'
            },
            {
                id_no: '1901103113',
                name: 'Jessa Mae Javier',
                year_level: '2nd Year',
                program: 'BSIT'
            },
            {
                id_no: '2101101979',
                name: 'Mark Anton  Lim',
                year_level: '1st Year',
                program: 'BSIT'
            },
            {
                id_no: '2101103848',
                name: 'Anna Marie Mendoza',
                year_level: '4th Year',
                program: 'BSIT'
            },            
            {
                id_no: '1901104713',
                name: 'Liza Reyes',
                year_level: '4th Year',
                program: 'BSIT'
            },            
            {
                id_no: '1901104188',
                name: 'Samuel Santos',
                year_level: '4th Year',
                program: 'BSIT'
            },
            {
                id_no: '1901104235',
                name: 'Mary Joy Alonzo',
                year_level: '3rd Year',
                program: 'BSIT'
            },
            {
                id_no: '1901104188',
                name: 'I AM',
                year_level: '4th Year',
                program: 'BSIT'
            },
            {
                id_no: '2101102924',
                name: 'ONLY TESTING',
                year_level: '4th Year',
                program: 'BSIT'
            },
            {
                id_no: '1901102046',
                name: 'IF THE PAGINATION',
                year_level: '3rd Year',
                program: 'BSIT'
            },
            {
                id_no: '2101101354',
                name: 'IS WORKING',
                year_level: '4th Year',
                program: 'BSIT'
            },
            {
                id_no: '1901103113',
                name: 'BLAH BLAH BLAH',
                year_level: '2nd Year',
                program: 'BSIT'
            },
            {
                id_no: '2101101979',
                name: 'PLACE NAME',
                year_level: '1st Year',
                program: 'BSIT'
            },
            {
                id_no: '2101103848',
                name: 'PERSON NAME',
                year_level: '4th Year',
                program: 'BSIT'
            },            
            {
                id_no: '1901104713',
                name: 'BACKSTORY STUFF',
                year_level: '4th Year',
                program: 'BSIT'
            },            
            {
                id_no: '1901104188',
                name: 'Samuel Santos',
                year_level: '4th Year',
                program: 'BSIT'
            },
            {
                id_no: '1901104235',
                name: 'Mary Joy Alonzo',
                year_level: '3rd Year',
                program: 'BSIT'
            }
        ];

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
        // Calculate the current items to display
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sampleStud.slice(indexOfFirstItem, indexOfLastItem);
        // Total pages
    const totalPages = Math.ceil(sampleStud.length / itemsPerPage);
        // Pagination handler
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
        // Calculate showing text
    const showingStart = indexOfFirstItem + 1;
    const showingEnd = Math.min(indexOfLastItem, sampleStud.length);
    const totalEntries = sampleStud.length;


    return (
        <div className="sb-nav-fixed">
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
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
                    <div className="container-fluid px-4 mb-5">
                        
                        {/* Student Standard Management Section */}
                        {/* <h1 className="mt-4">Student Standard Management</h1>
                        <ol className="breadcrumb mb-4">
                            <li className="breadcrumb-item"><a href="index.php">Dashboard</a></li>
                            <li className="breadcrumb-item active">Student Standard Management</li>
                        </ol>
                        
                        <div className="row">
                            <div className="col-md-6">
                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                        <ul className="list-unstyled">
                                            <li>{error}</li>
                                        </ul>
                                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>
                                )}
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="fas fa-user-plus"></i> Add Student into new Standard
                                    </div>
                                    <div className="card-body">
                                        <form method="post">
                                            <div className="mb-3">
                                                <label>Select Student <span className="text-danger">*</span></label>
                                                <select name="student_id" className="form-control">
                                                    <option value="">Select Student</option>
                                                    <option value="1">John Doe</option>
                                                    <option value="2">Jane Smith</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label>Select Academic Year <span className="text-danger">*</span></label>
                                                <select name="acedemic_year_id" className="form-control">
                                                    <option value="">Select Academic Year</option>
                                                    <option value="2024">2024</option>
                                                    <option value="2025">2025</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label>Select Standard <span className="text-danger">*</span></label>
                                                <select name="acedemic_standard_id" className="form-control">
                                                    <option value="">Select Standard</option>
                                                    <option value="1">Standard 1</option>
                                                    <option value="2">Standard 2</option>
                                                </select>
                                            </div>
                                            <div className="mt-4 mb-0">
                                                <input type="submit" name="add_student_standard" className="btn btn-success" value="Add" />
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        {/* Table Students */}
                        <div className="card mb-4 mt-5">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <i className="far fa-user me-2"></i> <strong>Students</strong>
                                    </div>
                                    <div className="col col-md-6" align="right">
                                        <a href="student_standard.php?action=add" className="btn btn-success btn-sm">Add</a>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                <table className="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Student ID</th>
                                            <th>Student Name</th>
                                            <th>Year Level</th>
                                            <th>Program</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((student, index) => (
                                            <tr key={student.id_no}>
                                                <td>{index + indexOfFirstItem + 1}</td> 
                                                <td>{student.id_no}</td>
                                                <td>{student.name}</td>
                                                <td>{student.year_level}</td>
                                                <td>{student.program}</td>
                                                <td>
                                                    <button className="btn btn-edit btm-lg" onClick={() => handleEditClick(student)}>
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button className="btn btn-archive btn-sm">
                                                        <i className="fas fa-archive"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* SHOWING OF ENTRIES AND PAGINATION */}
                                <div className="d-flex justify-content-between align-items-center mb-3" style={{ color: '#212529', fontSize: '0.875rem' }}>
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

export default TreasurerStudents;