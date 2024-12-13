// src/pages/governor/GovDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useCallback, useRef } from "react";
import GovSidebar from "./GovSidebar"; 
import GovNavbar from "./GovNavbar";
import axios from 'axios';
import { getAnalytics, logEvent } from "firebase/analytics";
import { app } from '../firebase/firebaseConfig';
import '../../assets/css/calendar.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { usePayment } from '../../context/PaymentContext';

const CALENDAR_ID = 'c_24e4973e704b983a944d5bc4cd1a7e0437d3eb519a1935d01706fb81909b68d3@group.calendar.google.com';
const CALENDAR_URL = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=UTC`;

const GovDashboard = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [totalActiveStudents, setTotalActiveStudents] = useState(0);
    const [totalActiveOfficers, setTotalActiveOfficers] = useState(0);
    const [activeCategories, setActiveCategories] = useState(0);
    const [totalFees, setTotalFees] = useState(0);
    const [showFullAmount, setShowFullAmount] = useState(false);
    const analytics = getAnalytics(app);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [recentPayments, setRecentPayments] = useState([]);
    const [error, setError] = useState(null);
    const { paymentUpdate } = usePayment();

    const toggleSidebar = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);

    // Fetch total active students
    useEffect(() => {
        const fetchTotalActiveStudents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/getAll/students', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data) {
                    const activeStudents = response.data.filter(student => !student.isArchived).length;
                    setTotalActiveStudents(activeStudents);
                }
            } catch (err) {
                console.error('Error fetching total active students:', err);
            }
        };

        fetchTotalActiveStudents();
    }, []);

    // Fetch total active officers
    useEffect(() => {
        const fetchTotalActiveOfficers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/admin/active-officers-count', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTotalActiveOfficers(response.data.count);
            } catch (err) {
                console.error('Error fetching total active officers:', err);
            }
        };

        fetchTotalActiveOfficers();
    }, []);

    // Fetch active categories
    useEffect(() => {
        const fetchActiveCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/payment-categories');
                if (response.data && response.data.categories) {
                    const activeCount = response.data.categories.filter(category => !category.isArchived).length;
                    setActiveCategories(activeCount);
                }
            } catch (err) {
                console.error('Error fetching active payment categories:', err);
            }
        };

        fetchActiveCategories();
    }, []);

    // Fetch total fees
    useEffect(() => {
        const fetchTotalFees = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/payment-fee/total-fees');
                if (response.data.success) {
                    setTotalFees(response.data.totalFees);
                } else {
                    console.error('Failed to fetch total fees:', response.data.error);
                    setTotalFees(0);
                }
            } catch (err) {
                console.error('Error fetching total fees:', err);
                setTotalFees(0);
            }
        };

        fetchTotalFees();
    }, []);

    // Fetch recent payments
    useEffect(() => {
        const fetchRecentPayments = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/payment-fee/recent-payments');
                if (response.data.success) {
                    setRecentPayments(response.data.payments);
                } else {
                    setError('No payments data received');
                }
            } catch (err) {
                setError('Failed to fetch recent payments');
                console.error('Error fetching recent payments:', err);
            } finally {
                setLoading(false);
            }
        };
 
        fetchRecentPayments();
    }, [paymentUpdate]);

    // Format amount helper function
    const formatAmount = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '₱0.00';
        }

        if (showFullAmount) {
            return `₱${amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        // For amounts >= 1000, show K format
        if (amount >= 1000) {
            return `₱${(amount / 1000).toFixed(1)}K`;
        }

        return `₱${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Analytics tracking
    useEffect(() => {
        logEvent(analytics, 'page_view', {
            page_title: 'Governor Dashboard',
            page_location: window.location.href,
            page_path: window.location.pathname,
            user_role: 'governor'
        });
    }, []);

    // Fetch files from Google Drive
    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/drive/files', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(response.data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    // Function to trigger file input click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Separate function to handle file selection
    const handleFileSelect = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedFile(file);
            handleFileUpload(file); // Automatically upload when file is selected
        }
    };

    // Handle file upload
    const handleFileUpload = async (file) => {
        if (!file) {
            console.error('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/drive/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });
            fetchFiles();
            setUploadProgress(0);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle file deletion
    const handleDeleteFile = async (fileId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/drive/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFiles(); // Refresh file list
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Filter files based on search
    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const indexOfLastFile = currentPage * itemsPerPage;
    const indexOfFirstFile = indexOfLastFile - itemsPerPage;
    const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

    // Add this function for calendar
    const handleAddToCalendar = () => {
        const addEventUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?cid=${encodeURIComponent(CALENDAR_ID)}`;
        window.open(addEventUrl, '_blank');
    };

    // Helper function to format file sizes
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Governor | Dashboard</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
            <GovNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <GovSidebar isCollapsed={isCollapsed} />
                <div 
                    id="layoutSidenav_content" 
                    style={{ 
                        marginLeft: isCollapsed ? '5rem' : '15.625rem',
                        marginRight: '0rem',
                        transition: 'margin-left 0.3s',
                        flexGrow: 1,
                        marginTop: '3.5rem' 
                    }}
                >
                    {/* CONTENT */}
                    <div className="container-fluid px-4">
                        {/* Welcome Message */}
                        <h4 className="mt-4 mb-4">Welcome back, Governor!</h4>

                        {/* Statistics Cards Row */}
                        <div className="row justify-content-center mb-4">
                            <div className="col-xl-3 col-md-6 mb-3">
                                <div className="card border-0" style={{
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div className="card-body d-flex align-items-center justify-content-center py-3"
                                        style={{
                                            backgroundColor: '#FF8C00',
                                            borderRadius: '15px'
                                        }}>
                                        <div className="text-center">
                                            <div className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                <i className="fas fa-user-graduate fa-lg text-white"></i>
                                            </div>
                                            <h5 className="mb-1 fw-bold text-white">{totalActiveStudents}</h5>
                                            <p className="mb-0 text-white">Active Students</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6 mb-3">
                                <div className="card border-0" style={{
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div className="card-body d-flex align-items-center justify-content-center py-3"
                                        style={{
                                            backgroundColor: '#FF8C00',
                                            borderRadius: '15px'
                                        }}>
                                        <div className="text-center">
                                            <div className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                <i className="fas fa-user-tie fa-lg text-white"></i>
                                            </div>
                                            <h5 className="mb-1 fw-bold text-white">{totalActiveOfficers}</h5>
                                            <p className="mb-0 text-white">Active Officers</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6 mb-3">
                                <div className="card border-0" style={{
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div className="card-body d-flex align-items-center justify-content-center py-3"
                                        style={{
                                            backgroundColor: '#FF8C00',
                                            borderRadius: '15px'
                                        }}>
                                        <div className="text-center">
                                            <div className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                <i className="fas fa-list fa-lg text-white"></i>
                                            </div>
                                            <h5 className="mb-1 fw-bold text-white">{activeCategories}</h5>
                                            <p className="mb-0 text-white">Categories</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6 mb-3" 
                                onMouseEnter={() => setShowFullAmount(true)}
                                onMouseLeave={() => setShowFullAmount(false)}>
                                <div className="card border-0" style={{
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div className="card-body d-flex align-items-center justify-content-center py-3"
                                        style={{
                                            backgroundColor: '#FF8C00',
                                            borderRadius: '15px'
                                        }}>
                                        <div className="text-center">
                                            <div className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                <i className="fas fa-money-bill-wave fa-lg text-white"></i>
                                            </div>
                                            <h5 className="mb-1 fw-bold text-white">{formatAmount(totalFees)}</h5>
                                            <p className="mb-0 text-white">Total Fees</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="row">
                            {/* Left Column - Calendar */}
                            <div className="col-xl-8 mb-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white border-0 py-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0 fw-semibold text-primary">
                                                <i className="far fa-calendar-alt me-2"></i>
                                                Calendar
                                            </h6>
                                            <button
                                                className="btn btn-outline-primary btn-sm px-3 py-1"
                                                onClick={handleAddToCalendar}
                                                style={{ fontSize: '0.8rem' }}
                                            >
                                                <i className="fas fa-plus me-1"></i>
                                                Add Event
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="calendar-wrapper" style={{ height: '500px' }}>
                                            <iframe
                                                src={CALENDAR_URL}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 'none'
                                                }}
                                                frameBorder="0"
                                                scrolling="no"
                                                title="Governor Calendar"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - File Upload */}
                            <div className="col-xl-4 mb-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white border-0 py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">
                                                <i className="fas fa-upload me-2 text-primary"></i>
                                                Upload Files
                                            </h5>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={handleUploadClick}
                                                disabled={loading}
                                            >
                                                <i className="fas fa-upload me-2"></i>
                                                Upload File
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="mb-3">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                style={{ display: 'none' }}
                                                onChange={handleFileSelect}
                                                disabled={loading}
                                            />
                                        </div>
                                        {uploadProgress > 0 && (
                                            <div className="progress mb-3">
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${uploadProgress}%` }}
                                                    aria-valuenow={uploadProgress}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                >
                                                    {uploadProgress}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* File List Section - Full Width */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">
                                                <i className="fas fa-file me-2 text-primary"></i>
                                                Files
                                            </h5>
                                            <div className="d-flex gap-2">
                                                <div className="position-relative">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm pe-4"
                                                        placeholder="Search files..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        style={{ width: '200px' }}
                                                    />
                                                    <i 
                                                        className="fas fa-search position-absolute" 
                                                        style={{ 
                                                            top: '50%', 
                                                            right: '10px', 
                                                            transform: 'translateY(-50%)',
                                                            color: '#FF8C00',
                                                            pointerEvents: 'none'
                                                        }}
                                                    ></i>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Type</th>
                                                        <th>Size</th>
                                                        <th>Modified</th>
                                                        <th className="text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentFiles.map((file) => (
                                                        <tr key={file.id}>
                                                            <td>{file.name}</td>
                                                            <td>{file.mimeType}</td>
                                                            <td>{formatFileSize(file.size)}</td>
                                                            <td>{new Date(file.modifiedTime).toLocaleString()}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                                    <a
                                                                        href={file.webViewLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{
                                                                            color: '#FF8C00',
                                                                            textDecoration: 'none',
                                                                            padding: '8px',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-eye" style={{ fontSize: '16px' }}></i>
                                                                    </a>
                                                                    <a
                                                                        href={file.webContentLink}
                                                                        download
                                                                        style={{
                                                                            color: '#28a745',
                                                                            textDecoration: 'none',
                                                                            padding: '8px',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-download" style={{ fontSize: '16px' }}></i>
                                                                    </a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="d-flex justify-content-center mt-3">
                                                <nav>
                                                    <ul className="pagination">
                                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                            >
                                                                Previous
                                                            </button>
                                                        </li>
                                                        {[...Array(totalPages)].map((_, i) => (
                                                            <li
                                                                key={i + 1}
                                                                className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                                                            >
                                                                <button
                                                                    className="page-link"
                                                                    onClick={() => setCurrentPage(i + 1)}
                                                                >
                                                                    {i + 1}
                                                                </button>
                                                            </li>
                                                        ))}
                                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                            <button
                                                                className="page-link"
                                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                            >
                                                                Next
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                       
                        {/* Recent Payments Table */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">
                                                <i className="fas fa-money-bill-wave me-2 text-primary"></i>
                                                Recent Payments
                                            </h5>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="mb-4 header">Recent Payments</h5>
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th className="index-column">#</th>
                                                    <th className="date-time-column">Date</th>
                                                    <th className="date-time-column">Time</th>
                                                    <th>Category Name</th>
                                                    <th>Student Name</th>
                                                    <th>Paid Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {loading ? (
                                                    <tr className="no-hover">
                                                        <td colSpan="6" style={{ border: 'none' }}>
                                                            <div style={{ 
                                                                display: 'flex', 
                                                                justifyContent: 'center', 
                                                                alignItems: 'center',
                                                                minHeight: '200px'  
                                                            }}>
                                                                <LoadingSpinner icon="coin"/>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : error ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center text-danger">{error}</td>
                                                    </tr>
                                                ) : recentPayments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center">No recent payments found</td>
                                                    </tr>
                                                ) : (
                                                    recentPayments.map((payment, index) => (
                                                        <tr key={payment.id}>
                                                            <td>{index + 1}</td>
                                                            <td>{new Date(payment.date).toLocaleDateString()}</td>
                                                            <td>{payment.paymentTime}</td> 
                                                            <td>{payment.categoryName}</td> 
                                                            <td>{payment.studentName}</td>
                                                            <td>₱{payment.paidAmount.toFixed(2)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovDashboard;