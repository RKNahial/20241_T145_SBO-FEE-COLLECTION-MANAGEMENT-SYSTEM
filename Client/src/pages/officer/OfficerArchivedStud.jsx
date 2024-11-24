// src//pages/treasurer/OfficerArchivedStud.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Preloader from '../../components/Preloader';
import OfficerSidebar from './OfficerSidebar';
import OfficerNavbar from './OfficerNavbar';
import axios from 'axios';

const OfficerArchivedStud = () => {
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
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState({ type: '', student: null });
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState("Active");

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

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

            return student.isArchived && matchesSearch; 
    });

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
            const userDetailsStr = localStorage.getItem('userDetails');

            if (!userDetailsStr) {
                setError('Session expired. Please login again.');
                return;
            }

            const userDetails = JSON.parse(userDetailsStr);
            const isArchiving = modalAction.type === 'archive';
            const endpoint = isArchiving ? 'archive' : 'unarchive';

            const response = await fetch(`http://localhost:8000/api/${endpoint}/${modalAction.student.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: userDetails.name || userDetails.email.split('@')[0],
                    userEmail: userDetails.email,
                    userPosition: userDetails.position,
                    userId: userDetails._id
                })
            });

            if (response.ok) {
                setSuccessMessage(`${modalAction.student.name} has been successfully ${modalAction.type}d!`);
                setStudents(prev => prev.map(s =>
                    s._id === modalAction.student.id
                        ? { ...s, isArchived: isArchiving }
                        : s
                ));
            } else {
                const errorData = await response.json();
                setError(typeof errorData.message === 'string' ? errorData.message : 'An error occurred');
            }
        } catch (error) {
            console.error('Archive error:', error);
            setError('Failed to perform action. Please try again.');
        } finally {
            setShowModal(false);
            setModalAction({ type: '', student: null });
            setTimeout(() => setSuccessMessage(""), 2500);
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

    const handleSearchSubmit = (e) => {
        e.preventDefault();
    };

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const checkEditLock = async (studentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8000/api/students/${studentId}/check-lock/EDIT`,
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
            return { locked: false };
        }
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Officer | Archived Students</title>
            </Helmet>
            <OfficerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <OfficerSidebar isCollapsed={isCollapsed} />
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
                                        <i className="fas fa-archive me-2"></i> <strong>Archived Students</strong>
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
                                    <Preloader open={loading} />
                                ) : (
                                    <>
                                        {/* Actions and Filters */}
                                        <div className="d-flex justify-content-end mb-3 align-items-center">
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
                                                                to={`/officer/students/edit/${student._id}`}
                                                                state={{ studentData: student }}
                                                                className="btn btn-edit btn-sm"
                                                                onClick={async (e) => {
                                                                    e.preventDefault();
                                                                    const lockStatus = await checkEditLock(student._id);
                                                                    if (lockStatus.locked) {
                                                                        setError(`This student is currently being edited by ${lockStatus.userName}`);
                                                                    } else {
                                                                        navigate(`/treasurer/students/edit/${student._id}`, {
                                                                            state: { studentData: student }
                                                                        });
                                                                    }
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

export default OfficerArchivedStud;