import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import TreasurerSidebar from './TreasurerSidebar';
import TreasurerNavbar from './TreasurerNavbar';

const TreasurerFeeCategory = () => {
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

    // File input reference
    const fileInputRef = useRef(null);

    // Fetch students from backend
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/getAll/students');
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                const data = await response.json();
                console.log('Fetched Data:', data);
                setStudents(data); // Directly set the fetched data
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
                const response = await fetch(`http://localhost:8000/api/archive/${studentId}`, { method: 'PUT' });
                if (response.ok) {
                    setSuccessMessage(`${studentName} has been successfully archived!`);
                    setStudents(prev => prev.map(s => s._id === studentId ? { ...s, isArchived: true } : s)); // Adjusted based on your field name
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
                    setStudents(prev => prev.map(s => s._id === studentId ? { ...s, isArchived: false } : s)); // Adjusted based on your field name
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
        const fileInput = fileInputRef.current;
        if (fileInput.files.length > 0) {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);

            try {
                const response = await fetch('http://localhost:8000/api/import-from-excel', {
                    method: 'POST',
                    body: formData,
                });
                if (response.ok) {
                    const result = await response.json();
                    setSuccessMessage('Students imported successfully!');
                    // You might want to trigger a refetch here
                } else {
                    const errorData = await response.json();
                    setError(errorData.error);
                }
            } catch (error) {
                setError('Error importing from Excel');
            } finally {
                setTimeout(() => setSuccessMessage(""), 2500);
                fileInput.value = ''; // Reset file input
            }
        } else {
            setError('Please select a file to import.');
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
                <title>Treasurer | Payment Category</title>
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
                                        <i className="fa fa-cog me-2"></i> <strong>Payment Category</strong>
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
                                                    to="/treasurer/manage-fee/payment-category/add-new" 
                                                    className="add-button btn btn-sm me-2"
                                                >
                                                    <i className="fa fa-plus me-2"></i>
                                                    Add Payment Category
                                                </Link>
                                            </div>
                                            <div className="d-flex align-items-center me-3">
                                                <label className="me-2 mb-0">Payment Category Status</label>
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
                                                    placeholder="Search payment category"
                                                    className="search-input me-2"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <button type="submit" className="search btn btn-sm">
                                                    <i className="fas fa-search"></i>
                                                </button>
                                            </form>
                                        </div>

                                        {/* Table of Payment Category */}
                                        <table className="table table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Payment Category ID</th>
                                                    <th>Payment Category</th>
                                                    <th>Total Price</th>
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
                                                        <td>{student.isArchived ? 'Archived' : 'Active'}</td> {/* Update based on isArchived */}
                                                        <td>
                                                            <Link
                                                                to={`/treasurer/manage-fee/payment-category/edit/${student._id}`}
                                                                state={{ studentData: student }}  // Pass the entire student object
                                                                className="btn btn-edit btn-sm"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
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

export default TreasurerFeeCategory;
