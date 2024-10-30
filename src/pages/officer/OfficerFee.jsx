// src/pages/officer/OfficerrFee.jsx
import React, { useState } from "react";
import TreasurerSidebar from "./OfficerNavbar"; 
import TreasurerNavbar from "./OfficerSidebar";
import ViewFeeModal from '../../components/ViewFeeModal';
import OfficerNavbar from "./OfficerNavbar";
import OfficerSidebar from "./OfficerSidebar";

const OfficerFee = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const sampleStud = [
        {
            id_no: '1901104188',
            name: 'Mary Joy Alonzo',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Fully Paid'
        },
        {
            id_no: '2101102924',
            name: 'Jonathan Cruz',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Partially Paid'
        },
        {
            id_no: '1901102046',
            name: 'Reena Dela Cruz',
            year_level: '3rd Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '2101101354',
            name: 'Peter John Garcia',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Fully Paid'
        },
        {
            id_no: '1901103113',
            name: 'Jessa Mae Javier',
            year_level: '2nd Year',
            program: 'BSIT',
            paymentStatus: 'Partially Paid'
        },
        {
            id_no: '2101101979',
            name: 'Mark Anton Lim',
            year_level: '1st Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '2101103848',
            name: 'Anna Marie Mendoza',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Fully Paid'
        },            
        {
            id_no: '1901104713',
            name: 'Liza Reyes',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Partially Paid'
        },            
        {
            id_no: '1901104188',
            name: 'Samuel Santos',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '1901104235',
            name: 'Mary Joy Alonzo',
            year_level: '3rd Year',
            program: 'BSIT',
            paymentStatus: 'Fully Paid'
        },
        {
            id_no: '1901104188',
            name: 'I AM',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Partially Paid'
        },
        {
            id_no: '2101102924',
            name: 'ONLY TESTING',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '1901102046',
            name: 'IF THE PAGINATION',
            year_level: '3rd Year',
            program: 'BSIT',
            paymentStatus: 'Fully Paid'
        },
        {
            id_no: '2101101354',
            name: 'IS WORKING',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Partially Paid'
        },
        {
            id_no: '1901103113',
            name: 'BLAH BLAH BLAH',
            year_level: '2nd Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '2101101979',
            name: 'PROPER NAME',
            year_level: '1st Year',
            program: 'BSIT',
            paymentStatus: 'Fully Paid'
        },
        {
            id_no: '2101103848',
            name: 'PLACE NAME',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Refunded'
        },            
        {
            id_no: '1901104713',
            name: 'BACKSTORY STUFF',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },            
        {
            id_no: '1901104188',
            name: 'Samuel Santos',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Fully Paid'
        },
        {
            id_no: '1901104235',
            name: 'Mary Joy Alonzo',
            year_level: '3rd Year',
            program: 'BSIT',
            paymentStatus: 'Refunded'
        }
    ];

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
    const currentItems = sampleStud.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sampleStud.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const showingStart = indexOfFirstItem + 1;
    const showingEnd = Math.min(indexOfLastItem, sampleStud.length);
    const totalEntries = sampleStud.length; 

    return (
        <div className="sb-nav-fixed">
            {/* NAVBAR AND SIDEBAR */}
            <OfficerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <OfficerSidebar isCollapsed={isCollapsed} />
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
                                        <i className="fas fa-hand-holding-usd me-2"></i> <strong>Review Fee</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                {/* SELECT CATEGORY AND SEARCH STUDENT */}
                                <div className="d-flex justify-content-between mb-3">
                                    <div className="d-flex align-items-center">
                                        <label className="me-2 mb-0">Payment Category</label>
                                        <div style={{ width: 'auto' }}>
                                            <select className="form-control" defaultValue="">
                                                <option value="" disabled>Select a category</option>
                                                <option value="College Shirt">College Shirt</option>
                                                <option value="Events">Events</option>
                                            </select>
                                        </div>
                                    </div>
                                    <form method="get" className="search-bar">
                                        <input type="text" placeholder="Search student" className="search-input" />
                                        <button type="submit" className="search">
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </form>
                                </div>

                                {/* TABLE STUDENTS */}
                                <table className="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Student ID</th>
                                            <th>Student Name</th>
                                            <th>Year Level</th>
                                            <th>Program</th>
                                            <th>Payment Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((student, index) => (
                                            <tr key={student.id_no}>
                                                <td>{index + indexOfFirstItem + 1}</td> 
                                                <td>{student.id_no}</td>
                                                <td>{student.name}</td>
                                                <td>{student.year_level}</td>
                                                <td>{student.program}</td>
                                                <td>
                                                    <PaymentStatusTag 
                                                        status={student.paymentStatus} 
                                                    />
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-view mx-2" 
                                                        onClick={() => handleViewClick(student)}
                                                    >
                                                        <i className="fas fa-eye"></i> 
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

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

export default OfficerFee;