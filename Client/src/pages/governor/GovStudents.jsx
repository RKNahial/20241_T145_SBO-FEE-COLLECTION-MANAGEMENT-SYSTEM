// src/pages/governor/GovStudents.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import GovSidebar from "./GovSidebar";
import GovNavbar from "./GovNavbar";
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/LockModal.css';

// Student Status Tag Component
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

const GovStudents = () => {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Active");
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState({ type: '', student: null });
    const [successMessage, setSuccessMessage] = useState("");
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockMessage, setLockMessage] = useState("");
    const [showArchived, setShowArchived] = useState(false);
    const itemsPerPage = 10;

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Fetch students from the server
    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/getAll/students', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                setStudents(response.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [students, searchTerm, statusFilter]);

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

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handle archive and unarchive actions
    const handleArchiveAction = async (studentId, studentName, isArchived) => {
        try {
            const token = localStorage.getItem('token');

            // First check if the student is locked
            const lockStatus = await axios.get(
                `http://localhost:8000/api/students/${studentId}/check-lock/ARCHIVE`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!lockStatus.data.success) {
                setLockMessage(`This student is currently being ${isArchived ? 'unarchived' : 'archived'} by ${lockStatus.data.userName}`);
                setShowLockModal(true);
                return;
            }

            setModalAction({
                type: isArchived ? 'unarchive' : 'archive',
                student: { id: studentId, name: studentName }
            });
            setShowModal(true);
        } catch (error) {
            console.error('Lock check error:', error);
            setError(error.response?.data?.message || 'Failed to check student lock status');
        }
    };

    const confirmAction = async () => {
        if (!modalAction.student) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8000/api/students/${modalAction.student.id}/toggle-archive`,
                {
                    isArchived: modalAction.type === 'archive'  // Add explicit archive status
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setSuccessMessage(`Student successfully ${modalAction.type}d`);
                await fetchStudents(); // Refresh the student list
            } else {
                throw new Error(response.data.message || 'Failed to update student status');
            }
        } catch (error) {
            console.error('Archive action error:', error);
            setError(error.response?.data?.message || `Failed to ${modalAction.type} student`);
        } finally {
            setShowModal(false);
            setModalAction({ type: '', student: null });
        }
    };

    const handleEditClick = (student) => {
        navigate(`/governor/students/edit/${student._id}`, {
            state: {
                studentData: {
                    _id: student._id,
                    name: student.name,
                    studentId: student.studentId,
                    institutionalEmail: student.institutionalEmail,
                    yearLevel: student.yearLevel,
                    program: student.program,
                    status: student.status,
                    isArchived: student.isArchived
                }
            }
        });
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | Students</title>
            </Helmet>

            <GovNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <GovSidebar isCollapsed={isCollapsed} />
                <div
                    id="layoutSidenav_content"
                    style={{
                        marginLeft: isCollapsed ? '5rem' : '15.625rem',
                        transition: 'margin-left 0.3s',
                        flexGrow: 1,
                        marginTop: '3.5rem',
                    }}
                >
                    <main>
                        <div className="container-fluid px-4" style={{ marginTop: '1.5rem' }}>
                            <div className="card mb-4">
                                <div className="card-header">
                                    <div className="row">
                                        <div className="col">
                                            <div className="d-flex align-items-center">
                                                <i className="far fa-user me-2"></i> <strong>Students</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-3 align-items-center">
                                        <div className="d-flex gap-3">
                                            {/* Add Student Button */}
                                            <Link
                                                to="/governor/students/add-new"
                                                className="btn btn-sm"
                                                style={{
                                                    backgroundColor: '#FF8C00',
                                                    color: 'white',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.4rem 0.8rem'
                                                }}
                                            >
                                                <i className="fas fa-plus me-1"></i>
                                                Add Student
                                            </Link>

                                            {/* Archive Button */}
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => {
                                                    setShowArchived(!showArchived);
                                                    setStatusFilter(showArchived ? "Active" : "Archived");
                                                }}
                                                style={{
                                                    backgroundColor: '#FF8C00',
                                                    color: 'white',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.4rem 0.8rem'
                                                }}
                                            >
                                                <i className={`fas fa-${showArchived ? 'box-open' : 'box-archive'} me-1`}></i>
                                                {showArchived ? 'Show Active' : 'Show Archived'}
                                            </button>
                                        </div>

                                        <div className="d-flex align-items-center gap-3">
                                            {/* Status Filter */}
                                            <div className="d-flex align-items-center me-3">
                                                <label className="me-2 mb-0">Student Status</label>
                                                <div className="dashboard-select" style={{ width: 'auto' }}>
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

                                            {/* Search Form */}
                                            <form
                                                className="d-flex search-bar"
                                                onSubmit={(e) => e.preventDefault()}
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Search student"
                                                    className="search-input me-2"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <button
                                                    type="submit"
                                                    className="search btn btn-sm"
                                                >
                                                    <i className="fas fa-search"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            <i className="fas fa-exclamation-circle me-2"></i>
                                            {error}
                                        </div>
                                    )}
                                    {successMessage && (
                                        <div className="alert alert-success" role="alert">
                                            <i className="fas fa-check-circle me-2"></i>
                                            {successMessage}
                                        </div>
                                    )}

                                    {loading ? (
                                        <LoadingSpinner
                                            text="Loading Students"
                                            icon="users"
                                            subtext="Fetching student records..."
                                        />
                                    ) : (
                                        <div className="table-responsive table-shadow">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th scope="col" style={{ width: '5%' }}>#</th>
                                                        <th scope="col" style={{ width: '15%' }}>Student ID</th>
                                                        <th scope="col" style={{ width: '25%' }}>Student Name</th>
                                                        <th scope="col" style={{ width: '20%' }}>Course</th>
                                                        <th scope="col" style={{ width: '15%' }}>Year Level</th>
                                                        <th scope="col" style={{ width: '10%' }}>Status</th>
                                                        <th scope="col" style={{ width: '10%' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="text-center py-4">
                                                                <i className="fas fa-search me-2"></i>
                                                                No students found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        currentItems.map((student, index) => (
                                                            <tr key={student._id}>
                                                                <td>{indexOfFirstItem + index + 1}</td>
                                                                <td>{student.studentId}</td>
                                                                <td>{student.name}</td>
                                                                <td>{student.program}</td>
                                                                <td>{student.yearLevel}</td>
                                                                <td>
                                                                    <StudentStatusTag
                                                                        status={student.isArchived ? 'Archived' : 'Active'}
                                                                        onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group">
                                                                        <button
                                                                            className="btn btn-edit btn-sm me-2"
                                                                            onClick={() => handleEditClick(student)}
                                                                            title="Edit Student"
                                                                        >
                                                                            <i className="fas fa-edit"></i>
                                                                        </button>
                                                                        <button
                                                                            className={`btn btn-archive btn-sm ${student.isArchived ? 'btn-open' : ''}`}
                                                                            onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                                                                            title={student.isArchived ? 'Unarchive Student' : 'Archive Student'}
                                                                        >
                                                                            <i className={`fas fa-${student.isArchived ? 'box-open' : 'archive'}`}></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                <div className="d-flex justify-content-between align-items-center"
                                    style={{
                                        paddingLeft: '1rem', paddingRight: '1rem'
                                    }}
                                >
                                    <div style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
                                    </div>
                                    <nav>
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    onClick={() => paginate(currentPage - 1)}
                                                    className="page-link"
                                                    disabled={currentPage === 1}
                                                    style={{ color: '#6C757D' }}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            {[...Array(totalPages)].map((_, index) => (
                                                <li
                                                    key={index}
                                                    className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}
                                                >
                                                    <button
                                                        onClick={() => paginate(index + 1)}
                                                        className="page-link"
                                                        style={index + 1 === currentPage ? {
                                                            backgroundColor: '#FF8C00',
                                                            borderColor: '#FF8C00',
                                                            color: '#EAEAEA'
                                                        } : {
                                                            color: '#6C757D'
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button
                                                    onClick={() => paginate(currentPage + 1)}
                                                    className="page-link"
                                                    disabled={currentPage === totalPages}
                                                    style={{ color: '#6C757D' }}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Archive/Unarchive Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalAction.type === 'archive' ? 'Archive Student' : 'Unarchive Student'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to {modalAction.type} {modalAction.student?.name}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant={modalAction.type === 'archive' ? 'danger' : 'success'}
                        onClick={confirmAction}
                    >
                        Confirm
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
                    <p className="text-muted mb-4">{lockMessage}</p>
                    <div className="d-flex justify-content-center">
                        <Button variant="secondary" onClick={() => setShowLockModal(false)}>
                            Close
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default GovStudents;