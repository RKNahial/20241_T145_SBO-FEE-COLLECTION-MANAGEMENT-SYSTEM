// src/pages/admin/AdminStudents.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { Modal, Button } from 'react-bootstrap';

const AdminStudents = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // State for students
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Active");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState({ type: '', student: null });
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch students from the server
    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Filter students based on search term and status
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

        switch (statusFilter) {
            case 'Active':
                return matchesSearch && !student.isArchived;
            case 'Archived':
                return matchesSearch && student.isArchived;
            case 'All':
                return matchesSearch;
            default:
                return matchesSearch && !student.isArchived;
        }
    });

    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    // StudentStatusTag component
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

    // Pagination function
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    // Handle archive and unarchive actions
    const handleArchiveAction = (studentId, studentName, isArchived) => {
        setModalAction({
            type: isArchived ? 'unarchive' : 'archive',
            student: { id: studentId, name: studentName }
        });
        setShowModal(true);
    };

    const confirmAction = async () => {
        try {
            const token = localStorage.getItem('token');
            const isArchiving = modalAction.type === 'archive';
            const endpoint = isArchiving ? 'archive' : 'unarchive';

            const response = await fetch(`http://localhost:8000/api/${endpoint}/${modalAction.student.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to ${modalAction.type} student`);
            }

            // Refresh the student list
            await fetchStudents();
            setShowModal(false);
            setSuccessMessage(`Student ${modalAction.type}d successfully`);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

        } catch (error) {
            console.error(`Error ${modalAction.type}ing student:`, error);
            setError(`Failed to ${modalAction.type} student`);
        }
    };

    // Handle opening Google Notes
    const handleOpenGoogleNotes = (studentId) => {
        const googleDocsUrl = `https://docs.google.com/document/d/${studentId}`;
        window.open(googleDocsUrl, '_blank');
    };

    // Reset to first page when students or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [students, searchTerm, statusFilter]);

    return (
        <div className="admin-container">
            <Helmet>
                <title>Admin - Students</title>
            </Helmet>
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div className="d-flex">
                <AdminSidebar isCollapsed={isCollapsed} />
                <div className="content-wrapper" style={{
                    marginLeft: isCollapsed ? '80px' : '240px',
                    width: 'calc(100% - ${isCollapsed ? "80px" : "240px"})',
                    transition: 'margin-left 0.3s ease-in-out',
                    padding: '20px'
                }}>
                    <div className="container-fluid">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="card-title">Students</h5>
                                    <Link to="/admin/students/add-new" className="btn btn-primary">
                                        <i className="fas fa-plus"></i> Add Student
                                    </Link>
                                </div>

                                {/* Search and Filter Section */}
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search by name or ID..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <div className="input-group-append">
                                                <span className="input-group-text">
                                                    <i className="fas fa-search"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <select
                                            className="form-control"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Archived">Archived</option>
                                            <option value="All">All</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Table Section */}
                                {loading ? (
                                    <p>Loading...</p>
                                ) : error ? (
                                    <p>Error: {error}</p>
                                ) : (
                                    <>
                                        <div className="table-responsive">
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
                                                            <td>{indexOfFirstItem + index + 1}</td>
                                                            <td>{student.studentId}</td>
                                                            <td>{student.name}</td>
                                                            <td>{student.yearLevel}</td>
                                                            <td>{student.program}</td>
                                                            <td>
                                                                <StudentStatusTag
                                                                    status={student.isArchived ? 'Archived' : 'Active'}
                                                                    onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <Link
                                                                    to={`/admin/students/edit/${student._id}`}
                                                                    state={{ studentData: student }}
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
                                                                    className={`btn btn-archive btn-sm ${student.isArchived ? 'btn-open' : ''}`}
                                                                    onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                                                                >
                                                                    <i className={`fas fa-${student.isArchived ? 'box-open' : 'archive'}`}></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

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

            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalAction.type === 'archive' ? 'Archive' : 'Unarchive'} Student
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to {modalAction.type} <strong>{modalAction.student?.name}</strong>?
                    </p>
                    {modalAction.type === 'archive' && (
                        <small style={{ color: '#6c757d', fontSize: '0.90rem' }}>
                            You can still unarchive the student if you change your mind.
                        </small>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="btn btn-confirm"
                        onClick={confirmAction}
                        style={{ flex: 'none' }}
                    >
                        Confirm
                    </Button>
                    <Button
                        variant="btn btn-cancel"
                        onClick={() => setShowModal(false)}
                        style={{ marginRight: '0.5rem', flex: 'none' }}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminStudents;