// src/pages/treasurer/TreasurerFee.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import ManageFeeModal from '../../components/ManageFeeModal';
import ViewFeeModal from '../../components/ViewFeeModal';
import Preloader from '../../components/Preloader';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import '../../styles/PaymentTabs.css';
import { usePayment } from '../../context/PaymentContext';

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
                const activeStudents = data.filter(student => !student.isArchived);
                setStudents(activeStudents);
            } catch (err) {
                setError(err.message);
                if (err.message.includes('Unauthorized')) {
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // GET CATEGORY NAME
    const getSelectedCategoryName = () => {
        const category = paymentCategories.find(cat => cat._id === selectedCategory);
        return category ? category.name : '';
    };

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

    const { triggerPaymentUpdate } = usePayment();

    const handleSubmit = async (formData) => {
        try {
            setStudents(prevStudents =>
                prevStudents.map(student =>
                    student._id === selectedStudent._id
                        ? { ...student, paymentstatus: formData.status }
                        : student
                )
            );

            // Update the categoryPayments state immediately
            setCategoryPayments(prev => ({
                ...prev,
                [selectedStudent._id]: {
                    status: formData.status,
                    amountPaid: parseFloat(formData.amountPaid),
                    totalPrice: formData.totalPrice
                }
            }));

            // Trigger payment update to refresh dashboards
            triggerPaymentUpdate();

            setSuccessMessage("Payment updated successfully!");
            setTimeout(() => {
                setSuccessMessage('');
            }, 2500);

            setIsModalOpen(false);

            // Refresh the data from server
            try {
                const token = localStorage.getItem('token'); // Get the token

                // Fetch updated students with authorization header
                const studentsResponse = await fetch('http://localhost:8000/api/getAll/students', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!studentsResponse.ok) {
                    throw new Error('Failed to refresh student data');
                }

                const studentsData = await studentsResponse.json();
                const activeStudents = studentsData.filter(student => !student.isArchived);
                setStudents(activeStudents);

                // Fetch updated payment data for the category
                if (selectedCategory) {
                    const paymentsResponse = await axios.get(
                        `http://localhost:8000/api/payment-fee/by-category/${selectedCategory}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );

                    if (paymentsResponse.data.success && Array.isArray(paymentsResponse.data.payments)) {
                        const paymentData = {};
                        paymentsResponse.data.payments.forEach(payment => {
                            if (payment.studentId) {
                                paymentData[payment.studentId._id] = {
                                    status: payment.status || 'Not Paid',
                                    amountPaid: payment.amountPaid || 0,
                                    totalPrice: payment.totalPrice || 0
                                };
                            }
                        });
                        setCategoryPayments(paymentData);
                    }
                }
            } catch (refreshError) {
                console.error('Error refreshing data:', refreshError);
                // Don't show error message since the transaction was successful
                // Just log it for debugging purposes
            }

        } catch (error) {
            console.error('Error updating payment status:', error);
            setError('Failed to update payment status');
            setTimeout(() => setError(null), 2500);
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
    const [searchTerm, setSearchTerm] = useState('');

    const filteredStudents = students.filter(student =>
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.program.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const showingStart = indexOfFirstItem + 1;
    const showingEnd = Math.min(indexOfLastItem, filteredStudents.length);
    const totalEntries = filteredStudents.length;

    // Add new state for payment categories
    const [paymentCategories, setPaymentCategories] = useState([]);

    // Add this useEffect to fetch payment categories
    useEffect(() => {
        const fetchPaymentCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/payment-categories');
                // Filter only active categories
                const activeCategories = response.data.categories.filter(category => !category.isArchived);
                setPaymentCategories(activeCategories);
            } catch (err) {
                console.error('Failed to fetch payment categories:', err);
            }
        };
        fetchPaymentCategories();
    }, []);

    // Update the handleEmailClick function
    const handleEmailClick = async (student) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8000/api/payment-fee/details/${student._id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                const paymentDetails = response.data.paymentFee;
                const templateParams = {
                    from_name: "COT-SBO COLLECTION FEE MANAGEMENT SYSTEM",
                    to_name: student.name,
                    to_email: student.institutionalEmail,
                    payment_category: paymentDetails.paymentCategory || 'N/A',
                    total_price: paymentDetails.totalPrice?.toString() || '0.00',
                    amount_paid: paymentDetails.amountPaid?.toString() || '0.00',
                    payment_status: student.paymentstatus,
                    transaction_history: paymentDetails.transactions?.map(t =>
                        `• Amount: ₱${t.amount.toFixed(2)}\n  Date: ${t.formattedDate}\n  Status: ${t.previousStatus || 'New'} → ${t.newStatus}`
                    ).join('\n\n') || 'No transaction history'
                };

                // Send email first
                const emailResponse = await emailjs.send(
                    "service_bni941i",
                    "template_x5s32eh",
                    templateParams,
                    "Nqbgnjhv9ss88DOrk" // Your EmailJS public key
                );

                if (emailResponse.status === 200) {
                    // Log the successful email sending
                    await axios.post(
                        'http://localhost:8000/api/history-logs/email',
                        {
                            studentId: student._id,
                            studentName: student.name,
                            studentEmail: student.institutionalEmail,
                            paymentDetails: {
                                category: paymentDetails.paymentCategory,
                                status: student.paymentstatus,
                                totalPrice: paymentDetails.totalPrice,
                                amountPaid: paymentDetails.amountPaid
                            }
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    setSuccessMessage(`Payment details sent to ${student.name}'s email successfully!`);
                    setTimeout(() => setSuccessMessage(''), 3000);
                }
            }
        } catch (error) {
            console.error('Error sending email:', error);
            setError('Failed to send email. Please try again.');
        }
    };

    const [selectedCategory, setSelectedCategory] = useState('');
    const [categoryPayments, setCategoryPayments] = useState({});

    // Modify the useEffect to fetch payments when category changes
    useEffect(() => {
        const fetchCategoryPayments = async () => {
            if (!selectedCategory) {
                setCategoryPayments({});
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8000/api/payment-fee/by-category/${selectedCategory}`);

                // Check if response.data.payments exists and is an array
                if (response.data.success && Array.isArray(response.data.payments)) {
                    const paymentData = {};
                    response.data.payments.forEach(payment => {
                        if (payment.studentId) {
                            paymentData[payment.studentId._id] = {
                                status: payment.status || 'Not Paid',
                                amountPaid: payment.amountPaid || 0,
                                totalPrice: payment.totalPrice || 0
                            };
                        }
                    });
                    setCategoryPayments(paymentData);
                } else {
                    console.error('Invalid response format:', response.data);
                    setError('Invalid response format from server');
                }
            } catch (err) {
                console.error('Error fetching payment data:', err);
                setError('Failed to fetch payment data');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryPayments();
    }, [selectedCategory]);

    // Update the category select handler
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    const getStudentPaymentStatus = (studentId) => {
        if (!selectedCategory) return 'Not Paid';
        const payment = categoryPayments[studentId];
        return payment ? payment.status : 'Not Paid';
    };

    // Add these new states after other state declarations
    const [activeTab, setActiveTab] = useState('All');

    // Add this function to get the count of students in each status
    const getStatusCounts = (students) => {
        const counts = students.reduce((acc, student) => {
            const status = getStudentPaymentStatus(student._id) || 'Not Paid';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, { All: students.length });
        return counts;
    };

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
                                            <select
                                                className="form-control"
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                            >
                                                <option value="">Select Category</option>
                                                {paymentCategories.map(category => (
                                                    <option key={category._id} value={category._id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <form className="d-flex search-bar" onSubmit={(e) => e.preventDefault()}>
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
                                {/* New Tab Navigation */}
                                <div className="payment-status-tabs">
                                    <ul className="nav nav-tabs">
                                        {['All', 'Fully Paid', 'Partially Paid', 'Not Paid', 'Refunded'].map(status => {
                                            const count = getStatusCounts(filteredStudents)[status] || 0;
                                            return (
                                                <li className="nav-item" key={status}>
                                                    <button
                                                        className={`nav-link ${activeTab === status ? 'active' : ''}`}
                                                        onClick={() => setActiveTab(status)}
                                                    >
                                                        {status}
                                                        <span className="badge bg-secondary ms-2">{count}</span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                {/* Table Content */}
                                {loading ? (
                                    <Preloader open={loading} />
                                ) : error ? (
                                    <div className="alert alert-danger">{error}</div>
                                ) : (
                                    <div className="table-responsive mt-3">
                                        <table className="table table-hover">
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
                                                {currentItems
                                                    .filter(student => {
                                                        if (activeTab === 'All') return true;
                                                        return getStudentPaymentStatus(student._id) === activeTab;
                                                    })
                                                    .map((student, index) => (
                                                        <tr key={student._id}>
                                                            <td>{indexOfFirstItem + index + 1}</td>
                                                            <td>{student.studentId}</td>
                                                            <td>{student.name}</td>
                                                            <td>{student.yearLevel}</td>
                                                            <td>{student.program}</td>
                                                            <td>
                                                                <PaymentStatusTag
                                                                    status={getStudentPaymentStatus(student._id) || 'Not Paid'}
                                                                />
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-edit btn-sm"
                                                                    onClick={() => handleEditClick(student)}
                                                                    disabled={!selectedCategory}
                                                                >
                                                                    <i className="fas fa-edit btn-edit-mx"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-view mx-2"
                                                                    onClick={() => handleViewClick(student)}
                                                                    disabled={!selectedCategory}
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </button>
                                                                <button
                                                                    className="btn btn-email"
                                                                    onClick={() => handleEmailClick(student)}
                                                                    disabled={!selectedCategory || getStudentPaymentStatus(student._id) === 'Not Paid'}
                                                                >
                                                                    <i className="fa-regular fa-envelope fa-md"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
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
                    selectedStudent={selectedStudent}
                    onSave={handleSubmit}
                    initialPaymentCategory={getSelectedCategoryName()}
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