import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import TreasurerSidebar from './TreasurerSidebar';
import TreasurerNavbar from './TreasurerNavbar';

const TreasurerStudents = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // State for students
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Fetch students from backend
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/getAll/students');
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                const data = await response.json();
                setStudents(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    // Filter students based on search and status
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.id_no?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || student.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // HANDLE ARCHIVE
    const handleArchive = async (studentName) => {
        const confirmArchive = window.confirm(`Are you sure you want to archive ${studentName}?`);
        if (confirmArchive) {
            // Add your API call here to update the student status
            setSuccessMessage(`${studentName} has been successfully archived!`);
            setTimeout(() => {
                setSuccessMessage("");
            }, 2500);
        }
    };

    // HANDLE UNARCHIVE
    const handleUnarchive = async (studentName) => {
        const confirmUnarchive = window.confirm(`Are you sure you want to unarchive ${studentName}?`);
        if (confirmUnarchive) {
            // Add your API call here to update the student status
            setSuccessMessage(`${studentName} has been successfully unarchived!`);
            setTimeout(() => {
                setSuccessMessage("");
            }, 2500);
        }
    };

    // HANDLE GOOGLE NOTES
    const handleOpenGoogleNotes = (studentId) => {
        const noteTitle = `Notes for ${studentId}`;
        const noteContent = `Add your notes for student ${studentId} here.`;
        const googleKeepUrl = `https://keep.google.com/#NOTE&title=${encodeURIComponent(noteTitle)}&text=${encodeURIComponent(noteContent)}`;
        window.open(googleKeepUrl, '_blank');
    };

    // HANDLE SEARCH
    const handleSearch = (e) => {
        e.preventDefault();
        // Search is already handled by the filteredStudents
    };

    // Pagination with filtered students
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const showingStart = indexOfFirstItem + 1;
    const showingEnd = Math.min(indexOfLastItem, filteredStudents.length);
    const totalEntries = filteredStudents.length;

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Students</title>
            </Helmet>
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
                <div
                    id="layoutSidenav_content"
                    style={{
                        marginLeft: isCollapsed ? '5rem' : '15.625rem',
                        transition: 'margin-left 0.3s',
                        flexGrow: 1,
                        marginTop: '3.5rem',
                    }}
                >
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <i className="far fa-user me-2"></i> <strong>Students</strong>
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
                                {loading ? (
                                    <div>Loading students...</div>
                                ) : (
                                    <>
                                        {/* ADD NEW STUDENT, IMPORT EXCEL, STATUS FILTER, AND SEARCH */}
                                        <div className="d-flex justify-content-between mb-3 align-items-center">
                                            <div className="d-flex me-auto">
                                                <Link to="/treasurer/students/add-new" className="add-button btn btn-sm me-2">
                                                    <i className="fas fa-plus me-2"></i>
                                                    Add New Student
                                                </Link>
                                                <button onClick={() => { }} className="add-button btn btn-sm me-2">
                                                    <i className="fas fa-file-excel me-2"></i>
                                                    Import Excel
                                                </button>
                                            </div>
                                            <div className="d-flex align-items-center me-3">
                                                <label className="me-2 mb-0">Student Status</label>
                                                <div className="dashboard-select" style={{ width: 'auto' }}>
                                                    <select
                                                        className="form-control"
                                                        value={statusFilter}
                                                        onChange={(e) => setStatusFilter(e.target.value)}
                                                    >
                                                        <option value="">All</option>
                                                        <option value="Active">Active</option>
                                                        <option value="Archived">Archived</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <form onSubmit={handleSearch} className="d-flex search-bar">
                                                <input
                                                    type="text"
                                                    placeholder="Search student"
                                                    className="search-input me-2"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <button type="submit" className="search btn btn-sm">
                                                    <i className="fas fa-search"></i>
                                                </button>
                                            </form>
                                        </div>

                                        {/* TABLE STUDENTS */}
                                        <table className="table table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Student ID</th>
                                                    <th>Student Name</th>
                                                    <th>Year Level</th>
                                                    <th>Program</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((student, index) => (
                                                    <tr key={student._id}>
                                                        <td>{index + indexOfFirstItem + 1}</td>
                                                        <td>{student.studentId}</td> {/* Ensure this matches your schema */}
                                                        <td>{student.name}</td>
                                                        <td>{student.yearLevel}</td> {/* Ensure this matches your schema */}
                                                        <td>{student.program}</td>
                                                        <td>{student.status || 'Active'}</td>
                                                        <td>
                                                            <Link to={`/treasurer/students/edit/${student._id}`} className="btn btn-edit btn-sm">
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <button
                                                                className="btn btn-notes btn-sm"
                                                                onClick={() => handleOpenGoogleNotes(student.studentId)}
                                                            >
                                                                <i className="fas fa-sticky-note"></i>
                                                            </button>
                                                            <button
                                                                className={`btn btn-archive btn-sm ${student.status === 'Archived' ? 'btn-open' : ''}`}
                                                                onClick={() => {
                                                                    if (student.status === 'Active') {
                                                                        handleArchive(student.name);
                                                                    } else {
                                                                        handleUnarchive(student.name);
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

                                        {/* PAGINATION */}
                                        <nav>
                                            <ul className="pagination justify-content-center">
                                                <li className="page-item disabled">
                                                    <span className="page-link">
                                                        Showing {showingStart} to {showingEnd} of {totalEntries} entries
                                                    </span>
                                                </li>
                                                <li className="page-item">
                                                    <button
                                                        onClick={() => paginate(currentPage - 1)}
                                                        className="page-link"
                                                        disabled={currentPage === 1}
                                                    >
                                                        Previous
                                                    </button>
                                                </li>
                                                {[...Array(totalPages)].map((_, index) => (
                                                    <li key={index} className="page-item">
                                                        <button
                                                            onClick={() => paginate(index + 1)}
                                                            className={`page-link ${index + 1 === currentPage ? 'active' : ''}`}
                                                        >
                                                            {index + 1}
                                                        </button>
                                                    </li>
                                                ))}
                                                <li className="page-item">
                                                    <button
                                                        onClick={() => paginate(currentPage + 1)}
                                                        className="page-link"
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
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

export default TreasurerStudents;