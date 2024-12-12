// src/pages/admin/AdminStudents.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminStudents = () => {
    const navigate = useNavigate();

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
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockMessage, setLockMessage] = useState("");

    // Utility function to truncate text
    const truncateText = (text, maxLength = 25) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

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
    const handleArchiveAction = async (studentId, studentName, isArchived) => {
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

    // Check if student is being edited
    const checkEditLock = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8000/api/students/${studentId}/check-lock/Edit`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            return {
                locked: !response.data.success,
                userName: response.data.userName
            };
        } catch (error) {
            console.error('Error checking lock:', error);
            throw error;
        }
    };

    const handleEditClick = async (student) => {
        try {
            const lockStatus = await checkEditLock(student._id);
            if (lockStatus.locked) {
                setLockMessage(`This student is currently being edited by ${lockStatus.userName}`);
                setShowLockModal(true);
                return;
            }
            navigate(`/admin/students/edit/${student._id}`, {
                state: { studentData: student }
            });
        } catch (error) {
            console.error('Error checking edit lock:', error);
            if (error.response?.status === 404) {
                setError('Lock service is currently unavailable. Please try again later.');
            } else {
                setError('Unable to edit student at this time. Please try again later.');
            }
        }
    };

    // Reset to first page when students or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [students, searchTerm, statusFilter]);

    // Add this sorting function after the state declarations
    const sortedItems = [...currentItems].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    return (
        <div className={`sb-nav-fixed ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Helmet>
                <title>Admin | Students</title>
            </Helmet>
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div className="d-flex">
                <AdminSidebar isCollapsed={isCollapsed} />
                <div className="content-wrapper" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    marginTop: '5rem', 
                    paddingTop: '2rem', 
                    transition: 'margin-left 0.3s ease',
                    width: `calc(100% - ${isCollapsed ? '5rem' : '15.625rem'})`,
                    padding: '1.5rem',
                    minHeight: 'calc(100vh - 4rem)',
                    position: 'relative', 
                    zIndex: 1 
                }}>
                    <div className="table-container">
                        <div className="container-fluid px-4">
                            <div className="content-card" style={{
                                backgroundColor: '#fff',
                                borderRadius: '0.5rem',
                                boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
                                padding: '1.5rem',
                                position: 'relative', 
                                zIndex: 1 
                            }}>
                                <div className="d-flex justify-content-between align-items-center mb-4" style={{ marginTop: '1rem' }}>
                                    <h5 className="card-title mb-0">
                                        <i className="fas fa-users text-primary me-2"></i>
                                        Student Management
                                    </h5>
                                    
                                </div>

                                {/* Search and Filter Section */}

                                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                                {/* Table Section */}
                                {loading ? (
                                    <LoadingSpinner
                                        text="Loading Students"
                                        icon="user-graduate"
                                        subtext="Fetching student records..."
                                    />
                                ) : error ? (
                                    <div className="alert alert-danger">
                                        <i className="fas fa-exclamation-circle me-2"></i>
                                        {error}
                                    </div>
                                ) : (
                                    <>
                                        <div className="table-responsive">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div className="d-flex gap-2">
                                                    <Link
                                                        to="/admin/students/add-new"
                                                        className="btn btn-add"
                                                        style={{
                                                            backgroundColor: '#FF8C00',
                                                            color: 'white',
                                                            padding: '0.5rem 1rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                    >
                                                        <i className="fas fa-plus"></i>
                                                        Add Student
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
                                                        <option value="Active">Active</option>
                                                        <option value="Archived">Archived</option>
                                                        <option value="All">All</option>
                                                    </select>
                                                    <div className="input-group" style={{ width: 'auto', position: 'relative' }}>
                                                        <span className="input-group-text" style={{ backgroundColor: 'transparent', border: 'none', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                                                            <i className="fas fa-search" style={{ color: 'orange' }}></i>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Search students..."
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                            aria-label="Search students"
                                                            style={{
                                                                paddingRight: '40px',
                                                                borderRadius: '5px',
                                                                border: '1px solid #ced4da',
                                                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                                width: '250px'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <table className="table table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">#</th>
                                                        <th scope="col">Student ID</th>
                                                        <th scope="col">Name</th>
                                                        <th scope="col">Program</th>
                                                        <th scope="col">Year Level</th>
                                                        <th scope="col">Status</th>
                                                        <th scope="col">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedItems.map((student, index) => (
                                                        <tr key={student._id}>
                                                            <td>{indexOfFirstItem + index + 1}</td>
                                                            <td>
                                                                <span className="fw-medium">{student.studentId}</span>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <div className="text-center" style={{ maxWidth: '250px' }}>
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            overlay={
                                                                                <Tooltip id={`tooltip-name-${student._id}`}>
                                                                                    {student.name}
                                                                                </Tooltip>
                                                                            }
                                                                        >
                                                                            <h6 
                                                                                className="mb-0" 
                                                                                style={{
                                                                                    maxWidth: '100%',
                                                                                    whiteSpace: 'nowrap',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis'
                                                                                }}
                                                                            >
                                                                                {truncateText(student.name, 30)}
                                                                            </h6>
                                                                        </OverlayTrigger>
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            overlay={
                                                                                <Tooltip id={`tooltip-email-${student._id}`}>
                                                                                    {student.institutionalEmail}
                                                                                </Tooltip>
                                                                            }
                                                                        >
                                                                            <small 
                                                                                className="text-muted" 
                                                                                style={{
                                                                                    maxWidth: '100%',
                                                                                    whiteSpace: 'nowrap',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    display: 'block'
                                                                                }}
                                                                            >
                                                                                {truncateText(student.institutionalEmail, 35)}
                                                                            </small>
                                                                        </OverlayTrigger>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{student.program}</td>
                                                            <td>{student.yearLevel}</td>
                                                            <td>
                                                                <StudentStatusTag
                                                                    status={student.isArchived ? 'Archived' : 'Active'}
                                                                    onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <Link
                                                                    to={`/admin/students/edit/${student._id}`}
                                                                    className="btn btn-edit btn-sm"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleEditClick(student);
                                                                    }}
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </Link>

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
                                                                style={index + 1 === currentPage ? { backgroundColor: 'orange', borderColor: 'orange', color: 'white' } : {color: 'black'}}
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

            {/* Lock Modal */}
            <Modal
                show={showLockModal}
                onHide={() => setShowLockModal(false)}
                centered
                className="lock-modal"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="w-100 text-center">
                        <div className="lock-icon-container mb-2">
                            <i className="fas fa-lock fa-2x text-warning"></i>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center pt-0">
                    <h5 className="modal-title mb-3">Student Record Locked</h5>
                    <p className="text-muted mb-4">
                        {lockMessage}
                    </p>
                    <div className="d-flex justify-content-center">
                        <Button
                            variant="secondary"
                            onClick={() => setShowLockModal(false)}
                        >
                            Close
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default AdminStudents;