import React, { useState, useEffect } from 'react';
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch students from backend
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/getAll/students');
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                const data = await response.json();
                console.log('Fetched Data:', data); // Check data structure here
                setStudents(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // Reset to first page when students or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [students, searchTerm, statusFilter]);

    // Filter students based on search and status
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesStatus = true;

        if (statusFilter === 'Active') {
            matchesStatus = student.status === 'Active';
        } else if (statusFilter === 'Archived') {
            matchesStatus = student.status === 'Archived';
        }

        return matchesSearch && matchesStatus;
    });

    // Handle archive and unarchive actions
    const handleArchive = async (studentId, studentName) => {
        const confirmArchive = window.confirm(`Are you sure you want to archive ${studentName}?`);
        if (confirmArchive) {
            try {
                const response = await fetch(`http://localhost:8000/api/archive/${studentId}`, { method: 'PUT' });
                if (response.ok) {
                    setSuccessMessage(`${studentName} has been successfully archived!`);
                    // Update students state to reflect the archived status
                    setStudents(prev => prev.map(s => s._id === studentId ? { ...s, status: 'Archived' } : s));
                } else {
                    const errorData = await response.json();
                    setError(errorData.error);
                }
            } catch (error) {
                setError('Failed to archive student');
            } finally {
                setTimeout(() => setSuccessMessage(""), 2500);
            }
        }
    };

    const handleUnarchive = async (studentId, studentName) => {
        const confirmUnarchive = window.confirm(`Are you sure you want to unarchive ${studentName}?`);
        if (confirmUnarchive) {
            try {
                const response = await fetch(`http://localhost:8000/api/unarchive/${studentId}`, { method: 'PUT' });
                if (response.ok) {
                    setSuccessMessage(`${studentName} has been successfully unarchived!`);
                    // Update students state to reflect the active status
                    setStudents(prev => prev.map(s => s._id === studentId ? { ...s, status: 'Active' } : s));
                } else {
                    const errorData = await response.json();
                    setError(errorData.error);
                }
            } catch (error) {
                setError('Failed to unarchive student');
            } finally {
                setTimeout(() => setSuccessMessage(""), 2500);
            }
        }
    };

    const handleExportToExcel = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/export-to-excel');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'students.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            setError('Error exporting to Excel');
        }
    };

    const handleOpenGoogleNotes = (studentId) => {
        const noteTitle = `Notes for ${studentId}`;
        const noteContent = `Add your notes for student ${studentId} here.`;
        const googleKeepUrl = `https://keep.google.com/#NOTE&title=${encodeURIComponent(noteTitle)}&text=${encodeURIComponent(noteContent)}`;
        window.open(googleKeepUrl, '_blank');
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
                                        {/* Actions and Filters */}
                                        <div className="d-flex justify-content-between mb-3 align-items-center">
                                            <div className="d-flex me-auto">
                                                <Link to="/treasurer/students/add-new" className="add-button btn btn-sm me-2">
                                                    <i className="fas fa-plus me-2"></i>
                                                    Add New Student
                                                </Link>
                                                <button onClick={handleExportToExcel} className="add-button btn btn-sm me-2">
                                                    <i className="fas fa-file-excel me-2"></i>
                                                    Export to Excel
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
                                            <form className="d-flex search-bar">
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

                                        {/* Table of Students */}
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
                                                        <td>{student.studentId}</td>
                                                        <td>{student.name}</td>
                                                        <td>{student.yearLevel}</td>
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
                                                                        handleArchive(student._id, student.name);
                                                                    } else {
                                                                        handleUnarchive(student._id, student.name);
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

                                        {/* Pagination */}
                                        <nav>
                                            <ul className="pagination justify-content-center">
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