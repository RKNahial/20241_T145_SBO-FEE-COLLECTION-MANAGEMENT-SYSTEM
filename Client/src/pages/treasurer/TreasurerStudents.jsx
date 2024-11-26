import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Modal, Button } from 'react-bootstrap';
import LoadingSpinner from '../../components/LoadingSpinner';
import TreasurerSidebar from './TreasurerSidebar';
import TreasurerNavbar from './TreasurerNavbar';
import Unauthorized from '../../components/Unauthorized';
import axios from 'axios';
import '../../styles/LockModal.css';

const renderActionButtons = (student) => {
    console.log('Rendering buttons with permissions:', permissions);
    return (
        <div className="btn-group">
            {permissions.updateStudent === 'edit' && (
                <button
                    className="btn btn-edit btn-sm me-2"
                    onClick={() => handleEditClick(student)}
                    title="Edit Student"
                >
                    <i className="fas fa-edit"></i>
                </button>
            )}
            {((student.isArchived && permissions.unarchiveStudent === 'edit') ||
                (!student.isArchived && permissions.archiveStudent === 'edit')) && (
                    <button
                        className="btn btn-archive btn-sm"
                        onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                        title={student.isArchived ? 'Unarchive Student' : 'Archive Student'}
                    >
                        <i className={`fas fa-${student.isArchived ? 'box-open' : 'box-archive'}`}></i>
                    </button>
                )}
        </div>
    );
};

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
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState({ type: '', student: null });
    const [lockMessage, setLockMessage] = useState("");
    const [showLockModal, setShowLockModal] = useState(false);
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState("Active");
    const [permissions, setPermissions] = useState({});
    const [isAuthorized, setIsAuthorized] = useState(true); // Default to true until we check permissions

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const token = localStorage.getItem('token');
                const userDetails = JSON.parse(localStorage.getItem('userDetails'));

                if (!token || !userDetails) {
                    setIsAuthorized(false);
                    return;
                }

                const response = await axios.get(
                    `http://localhost:8000/api/permissions/${userDetails._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const userPermissions = response.data.data || {};
                
                // Update permissions state
                setPermissions({
                    updateStudent: userPermissions.updateStudent || 'denied',
                    archiveStudent: userPermissions.archiveStudent || 'denied',
                    unarchiveStudent: userPermissions.unarchiveStudent || 'denied'
                });

                // Check if user has either view or edit permission
                const hasAccess = userPermissions.updateStudent === 'view' || userPermissions.updateStudent === 'edit';
                setIsAuthorized(hasAccess);

            } catch (error) {
                console.error('Error checking permissions:', error);
                setIsAuthorized(false);
            }
        };

        checkPermissions();
    }, [navigate]);

    if (!isAuthorized) {
        return <Unauthorized />;
    }

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

        switch (statusFilter) {
            case 'Active':
                return matchesSearch && !student.isArchived;
            case 'Archived':
                return matchesSearch && student.isArchived;
            case 'All':
                return matchesSearch;
            default:
                return matchesSearch && !student.isArchived; // Default to active
        }
    });

    // Handle archive and unarchive actions
    const handleArchiveAction = (studentId, studentName, isArchived) => {
        if (isArchived && permissions.unarchiveStudent !== 'edit') {
            setError('You do not have permission to unarchive students');
            return;
        }
        if (!isArchived && permissions.archiveStudent !== 'edit') {
            setError('You do not have permission to archive students');
            return;
        }

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

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(`${modalAction.student.name} has been successfully ${modalAction.type}d!`);
                setStudents(prev => prev.map(s =>
                    s._id === modalAction.student.id
                        ? { ...s, isArchived: isArchiving }
                        : s
                ));
            } else {
                setError(typeof data.message === 'string' ? data.message : 'An error occurred');
            }
        } catch (error) {
            console.error('Archive error:', error);
            setError('Failed to perform action. Please try again.');
        } finally {
            setShowModal(false);
            setModalAction({ type: '', student: null });
            setTimeout(() => {
                setSuccessMessage("");
                setError("");
            }, 2500);
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
            throw error; // Propagate the error to handle it in the calling function
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
            navigate(`/treasurer/students/edit/${student._id}`, {
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

    const handleArchive = (studentId, studentName) => {
        if (permissions.archiveStudent !== 'edit') {
            setError('You do not have permission to archive students');
            return;
        }
        handleArchiveAction(studentId, studentName, false);
    };

    const handleUnarchive = (studentId, studentName) => {
        if (permissions.unarchiveStudent !== 'edit') {
            setError('You do not have permission to unarchive students');
            return;
        }
        handleArchiveAction(studentId, studentName, true);
    };

    const renderActionButtons = (student) => {
        console.log('Rendering buttons with permissions:', permissions);
        return (
            <div className="btn-group">
                {permissions.updateStudent === 'edit' && (
                    <button
                        className="btn btn-edit btn-sm me-2"
                        onClick={() => handleEditClick(student)}
                        title="Edit Student"
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                )}
                {((student.isArchived && permissions.unarchiveStudent === 'edit') ||
                    (!student.isArchived && permissions.archiveStudent === 'edit')) && (
                        <button
                            className="btn btn-archive btn-sm"
                            onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                            title={student.isArchived ? 'Unarchive Student' : 'Archive Student'}
                        >
                            <i className={`fas fa-${student.isArchived ? 'box-open' : 'box-archive'}`}></i>
                        </button>
                    )}
            </div>
        );
    };

    return (
        <div className={`sb-nav-fixed ${isCollapsed ? 'sb-sidenav-toggled' : ''}`}>
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
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    minHeight: '300px' 
                                }}>
                                    <LoadingSpinner icon="user-graduate" />
                                </div>
                                ) : error ? (
                                    <div className="alert alert-danger">{error}</div>
                                ) : (
                                    < >
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
                                                    onClick={() => navigate('/treasurer/students/archived')}
                                                >
                                                    <i className="fas fa-archive me-2"></i>
                                                    Archived Students
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
                                                        <option value="Active">Active</option>
                                                        <option value="Archived">Archived</option>
                                                        <option value="All">All</option>
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
                                                            {renderActionButtons(student)}
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
                                    </ >
                                )} 
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                            className="px-4"
                            style={{
                                backgroundColor: '#6c757d',
                                border: 'none',
                                borderRadius: '5px',
                                padding: '8px 20px'
                            }}
                        >
                            Close
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            {/* Confirmation Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalAction.type === 'archive' ? 'Archive Student' : 'Unarchive Student'}
                    </Modal.Title>
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
        </div>
    );
};

export default TreasurerStudents;