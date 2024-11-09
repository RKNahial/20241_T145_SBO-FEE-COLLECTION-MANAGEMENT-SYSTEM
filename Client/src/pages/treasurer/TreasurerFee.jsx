// src/pages/treasurer/TreasurerFee.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import ManageFeeModal from '../../components/ManageFeeModal';
import ViewFeeModal from '../../components/ViewFeeModal';

const TreasurerFee = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/getAll/students');
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                const data = await response.json();
                // Filter only active students
                const activeStudents = data.filter(student => !student.isArchived);
                setStudents(activeStudents);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // PAYMENT TAG
    const PaymentStatusTag = ({ status, onClick }) => {
        let className;

        switch (status) {
            case 'Fully Paid':
                className = 'badge fully-paid';
                break;
            case 'Partially Paid':
                className = 'badge partially-paid';
                break;
            case 'Not Paid':
                className = 'badge not-paid';
                break;
            case 'Refunded':
                className = 'badge refunded';
                break;
            default:
                className = 'badge unknown';
        }

        return <span className={className} onClick={onClick} style={{ cursor: 'pointer' }}>{status}</span>;
    };

    // UPDATE PAYMENT MODAL
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [emailSuccessMessage, setEmailSuccessMessage] = useState('');

    const handleModalToggle = () => setIsModalOpen(!isModalOpen);

    const handleEditClick = (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    const handleSubmit = (formData) => {
        const confirmSave = window.confirm("Do you want to save changes?");
        if (confirmSave) {
            console.log('Submitted:', formData);
            setSuccessMessage("Payment updated successfully!");

            setTimeout(() => {
                setSuccessMessage('');
            }, 2500);

            setIsModalOpen(false);
        }
    };

    //  VIEW PAYMENT MODAL
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewedStudent, setViewedStudent] = useState(null);

    const handleViewClick = (student) => {
        setViewedStudent(student);
        setIsViewModalOpen(true);
    };

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = students.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(students.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const showingStart = indexOfFirstItem + 1;
    const showingEnd = Math.min(indexOfLastItem, students.length);
    const totalEntries = students.length;

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Manage Fee</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
                <div
                    id="layoutSidenav_content"
                    style={{
                        marginLeft: isCollapsed ? '5rem' : '15.625rem',
                        transition: 'margin-left 0.3s',
                        flexGrow: 1,
                        marginTop: '3.5rem'
                    }}
                >
                    {/* CONTENT */}
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <i className="fas fa-hand-holding-usd me-2"></i> <strong>Manage Fee</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                {/* SAVE UPDATES SUCCESS */}
                                {successMessage && (
                                    <div className="alert alert-success" role="alert">
                                        {successMessage}
                                    </div>
                                )}
                                {/* EMAIL SENT SUCCESS  */}
                                {emailSuccessMessage && (
                                    <div className="alert alert-success" role="alert">
                                        {emailSuccessMessage}
                                    </div>
                                )}
                              {/* SELECT CATEGORY AND SEARCH STUDENT */}
                            <div className="d-flex justify-content-between mb-3 align-items-center">
                                <div className="d-flex me-auto">
                                <Link 
                                    to="/treasurer/manage-fee/payment-category" 
                                    className="add-button btn btn-sm me-2"
                                >
                                    <i className="fas fa-cog me-2"></i>
                                    Manage Payment Category
                                </Link>
                                </div>
                                <div className="d-flex align-items-center me-3">
                                    <label className="me-2 mb-0">Payment Category</label>
                                    <div className="dashboard-select" style={{ width: 'auto' }}>
                                        <select className="form-control" defaultValue="">
                                            <option value="" disabled>Select a category</option>
                                            <option value="College Shirt">College Shirt</option>
                                            <option value="Events">Events</option>
                                        </select>
                                    </div>
                                </div>
                                <form className="d-flex search-bar">
                                    <input 
                                        type="text" 
                                        placeholder="Search student" 
                                        className="search-input me-2"
                                    />
                                    <button type="submit" className="search btn btn-sm">
                                        <i className="fas fa-search"></i>
                                    </button>
                                </form>
                            </div>
                                {/* TABLE STUDENTS */}
                                {loading ? (
                                    <div>Loading students...</div>
                                ) : error ? (
                                    <div className="alert alert-danger">{error}</div>
                                ) : (
                                    <table className="table table-bordered table-hover">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Student ID</th>
                                                <th>Student Name</th>
                                                <th>Year Level</th>
                                                <th>Program</th>
                                                <th>Payment Status</th>
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
                                                        <PaymentStatusTag
                                                            status={student.paymentstatus || 'Not Paid'}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-edit btn-sm"
                                                            onClick={() => handleEditClick(student)}
                                                        >
                                                            <i className="fas fa-edit btn-edit-mx"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-view mx-2"
                                                            onClick={() => handleViewClick(student)}
                                                        >
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button
                                                            className="btn btn-email"
                                                            onClick={() => handleEmailClick(student)}
                                                            disabled={student.paymentstatus === 'Refunded' || student.paymentstatus === 'Not Paid'}
                                                        >
                                                            <i className="fa-regular fa-envelope fa-md"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}

                                {/* SHOWING OF ENTRIES AND PAGINATION */}
                                <div className="d-flex justify-content-between align-items-center mb-2" style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                    <div>
                                        Showing {showingStart} to {showingEnd} of {totalEntries} entries
                                    </div>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className="page-item">
                                                <button
                                                    className="page-link"
                                                    onClick={() => paginate(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            {Array.from({ length: totalPages }, (_, index) => (
                                                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => paginate(index + 1)}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className="page-item">
                                                <button
                                                    className="page-link page-label"
                                                    onClick={() => paginate(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {/* MODAL FOR UPDATING STUDENT PAYMENT */}
            {isModalOpen && selectedStudent && (
                <ManageFeeModal
                    isOpen={isModalOpen}
                    onClose={handleModalToggle}
                    studentName={selectedStudent.name}
                    onSave={handleSubmit}
                />
            )}

            {/* MODAL FOR VIEWING STUDENT FEE */}
            {isViewModalOpen && viewedStudent && (
                <ViewFeeModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    student={viewedStudent}
                />
            )}
        </div>

    );
};

export default TreasurerFee;