// src/pages/treasurer/TreasurerStudents.jsx
import React, { useState, useRef } from "react";
import { Link } from 'react-router-dom';
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

    // EDIT STUDENT -- CURRENTLY NOT WORKING
    // const handleEditClick = (student) => {
    //     setEditingStudent(student);
    // };

    // const handleSave = (updatedStudent) => {
    //     setStudents((prevStudents) => 
    //         prevStudents.map((s) => 
    //             s.id_no === updatedStudent.id_no ? updatedStudent : s
    //         )
    //     );
    //     setEditingStudent(null);
    // };

    // const handleCancel = () => {
    //     setEditingStudent(null);
    // };

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

                        {/* EDIT STUDENT FORM (Only shows when edit button is clicked -- CURENTLY NOT WORKING)
                        {editingStudent && (
                            <div className="card mb-4">
                                <div className="card-header">Edit Student</div>
                                <div className="card-body">
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSave(editingStudent);
                                    }}>
                                        <div className="mb-3">
                                            <label>Student ID</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingStudent.name}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                            />
                                        </div>
                                                                            }}>
                                        <div className="mb-3">
                                            <label>Student Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingStudent.name}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label>Year Level</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingStudent.year_level}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, year_level: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label>Program</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingStudent.program}
                                                onChange={(e) => setEditingStudent({ ...editingStudent, program: e.target.value })}
                                            />
                                        </div>
                                        <button type="submit" className="btn btn-success">Save</button>
                                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                                    </form>
                                </div>
                            </div>
                        )} */}

                        <div className="card mb-4 mt-5">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <i className="far fa-user me-2"></i> <strong>Students</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">

                                {/* ADD NEW STUDENT AND IMPORT EXCEL BUTTON */}
                                <div className="d-flex justify-content-between mb-3">
                                    <div className="d-flex">
                                        <Link to="/treasurer/students/add-new" className="add-button btn btn-sm me-2">
                                            <i className="fas fa-plus me-2"></i>
                                            Add New Student
                                        </Link>
                                        <button onClick={handleImportClick} className="add-button btn btn-sm">
                                            <i className="fas fa-file-excel me-2"></i>
                                            Import Excel
                                        </button>
                                        <input
                                            type="file"
                                            accept=".xls,.xlsx"
                                            ref={fileInputRef}
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <form method="get" className="search-bar ">
                                        <input type="text" placeholder="Search student" className="search-input" />
                                        <button type="submit" className="search">
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </form>
                                </div>

                                {/* TABLE STUDENTS*/}
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

export default TreasurerStudents;