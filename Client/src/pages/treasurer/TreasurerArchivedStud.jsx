import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Modal, Button } from 'react-bootstrap';
import Preloader from '../../components/Preloader';
import TreasurerSidebar from './TreasurerSidebar';
import TreasurerNavbar from './TreasurerNavbar';
import axios from 'axios';

const TreasurerArchivedStud = () => {
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
            // Filter only archived students before setting the state
            const archivedStudents = data.filter(student => student.isArchived === true);
            setStudents(archivedStudents);
            setLoading(false); 
        } catch (err) {
            setError(err.message);
            setLoading(false); 
        }
    };

    const filteredStudents = students.filter(student => {
        return student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [students, searchTerm]);

    useEffect(() => {
        fetchStudents();
    }, []);

    // Handle archive and unarchive actions
    const handleArchiveAction = (studentId, studentName) => {
        setModalAction({
            type: 'unarchive',  // Always unarchive
            student: { id: studentId, name: studentName }
        });
        setShowModal(true);
    };

    const confirmAction = async () => {
        try {
            const token = localStorage.getItem('token');
            const userDetails = JSON.parse(localStorage.getItem('userDetails'));

            const response = await fetch(`http://localhost:8000/api/unarchive/${modalAction.student.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userDetails._id,
                    userPosition: userDetails.position
                })
            });

            if (response.ok) {
                setSuccessMessage(`${modalAction.student.name} has been successfully unarchived!`);
                // Remove the unarchived student from the list
                setStudents(prev => prev.filter(s => s._id !== modalAction.student.id));
            } else {
                const errorData = await response.json();
                setError(errorData.error);
            }
        } catch (error) {
            setError('Failed to unarchive student');
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

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Archived Students</title>
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
                                                                onClick={() => handleArchiveAction(student._id, student.name, student.isArchived)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <Link
                                                                to={`/treasurer/students/edit/${student._id}`}
                                                                state={{ studentData: student }}
                                                                className="btn btn-edit btn-sm"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <button
                                                                className="btn btn-archive btn-open btn-sm"
                                                                onClick={() => handleArchiveAction(student._id, student.name)}
                                                            >
                                                                <i className="fas fa-box-open"></i>
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
                        Unarchive Student
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to unarchive <strong>{modalAction.student?.name}</strong>?
                    </p>
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

export default TreasurerArchivedStud;