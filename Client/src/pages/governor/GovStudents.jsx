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

// Add styles
const styles = {
    searchContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    formSelect: {
        padding: '0.375rem 2.25rem 0.375rem 0.75rem',
        fontSize: '0.875rem',
        fontWeight: '400',
        lineHeight: '1.5',
        color: '#212529',
        backgroundColor: '#fff',
        border: '1px solid #ced4da',
        borderRadius: '0.25rem',
        transition: 'border-color .15s ease-in-out,box-shadow .15s ease-in-out',
    }
};

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
            const lockStatus = await axios.get(
                `http://localhost:8000/api/students/${studentId}/check-lock/ARCHIVE`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
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
            console.error('Error:', error);
            setError(error.response?.data?.message || 'An error occurred');
        }
    };

    const confirmAction = async () => {
        if (!modalAction.student) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8000/api/students/${modalAction.student.id}/toggle-archive`,
                {},
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setSuccessMessage(`Student successfully ${modalAction.type}d`);
                fetchStudents();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update student status');
        }

        setShowModal(false);
        setModalAction({ type: '', student: null });
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | Students</title>
            </Helmet>

            <GovNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <GovSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{ marginLeft: isCollapsed ? '5rem' : '15.625rem', transition: 'margin-left 0.3s', flexGrow: 1, marginTop: '3.5rem' }}>
                    <main>
                        <div className="container-fluid px-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <h1 className="mt-4 mb-4">Students</h1>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => navigate('/governor/students/add-new')}
                                >
                                    <i className="fas fa-plus me-2"></i>Add Student
                                </button>
                            </div>
                            <div className="card shadow-sm border-0 mb-3">
                                <div className="card-header bg-white py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="card-title mb-0">
                                            <i className="fas fa-users me-2 text-primary"></i>
                                            Students List
                                        </h5>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="me-2">
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    style={styles.formSelect}
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Archived">Archived</option>
                                                    <option value="All">All</option>
                                                </select>
                                            </div>
                                            <div className="search-container" style={styles.searchContainer}>
                                                <input
                                                    type="text"
                                                    placeholder="Search student"
                                                    className="form-control form-control-sm"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    style={{ minWidth: '200px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body">
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <LoadingSpinner />
                                        </div>
                                    ) : error ? (
                                        <div className="alert alert-danger">{error}</div>
                                    ) : (
                                        <>
                                            {successMessage && (
                                                <div className="alert alert-success alert-dismissible fade show">
                                                    {successMessage}
                                                    <button type="button" className="btn-close" onClick={() => setSuccessMessage("")}></button>
                                                </div>
                                            )}

                                            <table className="table table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th className="index-column">#</th>
                                                        <th>Student ID</th>
                                                        <th className="name-column">Student Name</th>
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
                                                                    onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div className="btn-group">
                                                                    <button
                                                                        className="btn btn-edit btn-sm me-2"
                                                                        onClick={() => navigate(`/governor/edit-student/${student._id}`)}
                                                                        title="Edit Student"
                                                                    >
                                                                        <i className="fas fa-edit"></i>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-archive btn-sm"
                                                                        onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                                                                        title={student.isArchived ? 'Unarchive Student' : 'Archive Student'}
                                                                    >
                                                                        <i className={`fas fa-${student.isArchived ? 'box-open' : 'box-archive'}`}></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* Pagination */}
                                            <div className="d-flex justify-content-between align-items-center mb-2" style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                                <div>
                                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStudents.length)} of {filteredStudents.length} entries
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