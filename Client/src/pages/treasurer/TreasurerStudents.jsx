import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import TreasurerSidebar from './TreasurerSidebar';
import TreasurerNavbar from './TreasurerNavbar';
import axios from 'axios';

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

    // STUDENT STATUS TAG
    const StudentStatusTag = ({ status, onClick }) => {
        let className;

        switch (status) {
            case 'Active':
                className = 'badge active-status';
                break;
            case 'Archived':
                className = 'badge archived-status';
                break;
            default:
                className = 'badge unknown-status';
        }

        return <span className={className} onClick={onClick} style={{ cursor: 'pointer' }}>{status}</span>;
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // File input reference
    const fileInputRef = useRef(null);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token'); // Get token from localStorage
            const response = await fetch('http://localhost:8000/api/getAll/students', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized access. Please login again.');
                }
                throw new Error('Failed to fetch students');
            }

            const data = await response.json();
            setStudents(data);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('Unauthorized')) {
                // Handle unauthorized access (e.g., redirect to login)
                // You might want to implement a redirect here
            }
        } finally {
            setLoading(false);
        }
    };

    // Use fetchStudents in useEffect
    useEffect(() => {
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

        // Include all students if no filter is selected, otherwise check the status
        let matchesStatus = true;
        if (statusFilter === 'Active') {
            matchesStatus = student.isArchived === false; // Adjusted based on your field name
        } else if (statusFilter === 'Archived') {
            matchesStatus = student.isArchived === true; // Adjusted based on your field name
        }

        return matchesSearch && matchesStatus;
    });

    // Handle archive and unarchive actions
    const handleArchive = async (studentId, studentName) => {
        const confirmArchive = window.confirm(`Are you sure you want to archive ${studentName}?`);
        if (confirmArchive) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8000/api/archive/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    setSuccessMessage(`${studentName} has been successfully archived!`);
                    setStudents(prev => prev.map(s => s._id === studentId ? { ...s, isArchived: true } : s));
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
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8000/api/unarchive/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    setSuccessMessage(`${studentName} has been successfully unarchived!`);
                    setStudents(prev => prev.map(s => s._id === studentId ? { ...s, isArchived: false } : s));
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

    const handleUpdateStudent = async (studentId, updatedData) => {
        try {
            const response = await fetch(`http://localhost:8000/api/update/students/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error('Failed to update student');
            }

            // Update the local state with the new data
            setStudents(prev => prev.map(student =>
                student._id === studentId ? { ...student, ...updatedData } : student
            ));
            setSuccessMessage('Student updated successfully!');
        } catch (error) {
            setError('Failed to update student');
        }
    };

    const handleImportFromExcel = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            setError('Please select a file to import.');
            return;
        }

        const fileType = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls'].includes(fileType)) {
            setError('Please upload only Excel files (.xlsx or .xls)');
            return;
        }

        const formData = new FormData();
        formData.append('excel-file', file);

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8000/api/import-excel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.data) {
                setSuccessMessage(response.data.message);
                if (response.data.errors) {
                    console.warn('Import warnings:', response.data.errors);
                }
                await fetchStudents(); // Refresh the list after import
            }
        } catch (error) {
            console.error('Import error:', error);
            setError(error.response?.data?.error || 'Error importing from Excel');
        } finally {
            setLoading(false);
            event.target.value = '';
            setTimeout(() => {
                setSuccessMessage("");
                setError(null);
            }, 2500);
        }
    };

    const handleOpenGoogleNotes = (studentId) => {
        const noteTitle = `Notes for ${studentId}`;
        const noteContent = `Add your notes for student ${studentId} here.`;
        const googleKeepUrl = `https://keep.google.com/#NOTE&title=${encodeURIComponent(noteTitle)}&text=${encodeURIComponent(noteContent)}`;
        window.open(googleKeepUrl, '_blank');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
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
                                        <i className="fa fa-cog me-2"></i> <strong>Students</strong>
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
                                                <Link
                                                    to="/treasurer/students/add-new"
                                                    className="add-button btn btn-sm me-2"
                                                >
                                                    <i className="fas fa-plus me-2"></i>
                                                    Add New Student
                                                </Link>
                                                <button
                                                    className="add-button btn btn-sm me-2"
                                                    onClick={() => fileInputRef.current.click()} // Trigger file input
                                                >
                                                    <i className="fas fa-file-import me-2"></i>
                                                    Import from Excel
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    accept=".xlsx, .xls"
                                                    style={{ display: 'none' }}
                                                    onChange={handleImportFromExcel}
                                                />
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
                                            <form className="d-flex search-bar" onSubmit={handleSearchSubmit}>
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
                                                        <td>
                                                            <StudentStatusTag
                                                                status={student.isArchived ? 'Archived' : 'Active'}
                                                                onClick={() => {
                                                                    if (student.isArchived) {
                                                                        handleUnarchive(student._id, student.name);
                                                                    } else {
                                                                        handleArchive(student._id, student.name);
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Link
                                                                to={`/treasurer/students/edit/${student._id}`}
                                                                state={{ studentData: student }}  // Pass the entire student object
                                                                className="btn btn-edit btn-sm"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <button
                                                                className="btn btn-notes btn-sm"
                                                                onClick={() => handleOpenGoogleNotes(student.studentId)}
                                                            >
                                                                <i className="fas fa-sticky-note"></i>
                                                            </button>
                                                            <button
                                                                className={`btn btn-archive btn-sm ${student.isArchived ? 'btn-open' : ''}`} // Update based on isArchived
                                                                onClick={() => {
                                                                    if (student.isArchived) {
                                                                        handleUnarchive(student._id, student.name);
                                                                    } else {
                                                                        handleArchive(student._id, student.name);
                                                                    }
                                                                }}
                                                            >
                                                                <i className={`fas fa-${student.isArchived ? 'box-open' : 'archive'}`}></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
                                        <div className="d-flex justify-content-between align-items-center mb-2" style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                            <div>
                                                Showing {indexOfFirstItem + 1} to {indexOfLastItem} of {filteredStudents.length} entries
                                            </div>
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

export default TreasurerStudents;