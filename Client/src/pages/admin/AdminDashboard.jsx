// src/pages/admin/AdminDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import axios from 'axios';
import { getAnalytics, logEvent } from "firebase/analytics";
import { app } from '../firebase/firebaseConfig';
import '../../assets/css/calendar.css';
import LoadingSpinner from '../../components/LoadingSpinner'; 
import { usePayment } from '../../context/PaymentContext';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import '../../assets/css/calendar.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const CALENDAR_ID = 'c_24e4973e704b983a944d5bc4cd1a7e0437d3eb519a1935d01706fb81909b68d3@group.calendar.google.com';
const CALENDAR_URL = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=UTC&hl=en`;

const AdminDashboard = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [stats, setStats] = useState({
        totalActiveStudents: 0,
        totalActiveOfficers: 0,
        totalAdmins: 0,
        pageViews: 0
    });
    const analytics = getAnalytics(app);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [recentLogs, setRecentLogs] = useState([]);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [reportLoading, setReportLoading] = useState(true);
    const [reportError, setReportError] = useState(null);

    const toggleSidebar = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);

    useEffect(() => {
    const fetchReportData = async () => {
        setReportLoading(true);
        try {
            const currentYear = new Date().getFullYear();
            const response = await axios.get(`http://localhost:8000/api/payment-fee/reports/by-program?year=${currentYear}`);
            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (err) {
            setReportError('Failed to fetch report data');
            console.error('Error:', err);
        } finally {
            setReportLoading(false);
        }
    };

    fetchReportData();
}, []);

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch all stats in parallel
            const [studentsRes, officersRes, adminsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/active-students-count', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:8000/api/admin/active-officers-count', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:8000/api/admin/active-admins-count', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats({
                totalActiveStudents: studentsRes.data.count,
                totalActiveOfficers: officersRes.data.count,
                totalAdmins: adminsRes.data.count,
                pageViews: 0 // This can be implemented later if needed
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const [showFullAmount, setShowFullAmount] = useState(false);
    const [totalFees, setTotalFees] = useState(0);
    const formatAmount = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '₱0.00';
        }

        // Show full amount if showFullAmount is true
        if (showFullAmount) {
            return `₱${amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        // Format for trillions
        if (amount >= 1_000_000_000_000) {
            return `₱${(amount / 1_000_000_000_000).toFixed(1)}T`;
        }

        // Format for billions
        if (amount >= 1_000_000_000) {
            return `₱${(amount / 1_000_000_000).toFixed(1)}B`;
        }

        // Format for millions
        if (amount >= 1_000_000) {
            return `₱${(amount / 1_000_000).toFixed(1)}M`;
        }

        // Format for thousands
        if (amount >= 1_000) {
            return `₱${(amount / 1_000).toFixed(1)}K`;
        }

        // Format regular numbers
        return `₱${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const { paymentUpdate } = usePayment();
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
    }, [paymentUpdate]);



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
    
    const [calendarLoading, setCalendarLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCalendarLoading(false);
        }, 1500); 

        return () => clearTimeout(timer);
    }, []);
    
    useEffect(() => {
        const fetchRecentLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    'http://localhost:8000/api/history-logs/recent',  
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
        
                if (response.data.success) {
                    const formattedLogs = response.data.logs.map(log => {
                        const timestamp = new Date(log.timestamp);
                        return {
                            ...log,
                            date: timestamp.toLocaleDateString(),
                            time: timestamp.toLocaleTimeString(),
                            user: `${log.userName} (${log.userPosition})`
                        };
                    });
                    setRecentLogs(formattedLogs);
                }
            } catch (error) {
                console.error('Error fetching recent logs:', error);
                setError('Error loading recent logs');
            } finally {
                setLoading(false);
            }
        };
    
        fetchRecentLogs();
    }, []);

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
        fetchStats();
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

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Dashboard</title>
            </Helmet>
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    marginRight: '0rem',
                    transition: 'margin-left 0.3s',
                    flexGrow: 1,
                    marginTop: '3.5rem'
                }}>
                    <div className="container-fluid px-4">
                        {/* Welcome Message */}
                        <p className="system-gray mt-4 welcome-text">Welcome back, admin!</p>

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
                                            <h5 className="mb-1 fw-bold text-white">{stats.totalActiveStudents}</h5>
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
                                            <h5 className="mb-1 fw-bold text-white">{stats.totalActiveOfficers}</h5>
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
                                                <i className="fas fa-user-shield fa-lg text-white"></i>
                                            </div>
                                            <h5 className="mb-1 fw-bold text-white">{stats.totalAdmins}</h5>
                                            <p className="mb-0 text-white">Total Admins</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-xl-3 col-md-6 mb-3">
                                {/* Total Fees Card */}
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
                                            <h5 className="mb-1 fw-bold text-white" onClick={() => setShowFullAmount(!showFullAmount)} style={{ cursor: 'pointer' }}>
                                                {formatAmount(totalFees)}
                                            </h5>
                                            <p className="mb-0 text-white">Total Fees</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Recent History Logs Table */}
                        <div className="card-body">
                            <h5 className="mb-4 header">Recent Activity Logs</h5>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th className="index-column">#</th>
                                            <th className="date-time-column">Date</th>
                                            <th className="date-time-column">Time</th>
                                            <th>User</th>
                                            <th>Action</th>
                                            <th>Details</th>
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
                                                        <LoadingSpinner icon="history"/>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan="6" className="text-center text-danger">
                                                    <i className="fas fa-exclamation-circle me-2"></i>
                                                    {error}
                                                </td>
                                            </tr>
                                        ) : recentLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    No recent activity found
                                                </td>
                                            </tr>
                                        ) : (
                                            recentLogs.map((log, index) => (
                                                <tr key={log._id}>
                                                    <td>{index + 1}</td>
                                                    <td>{log.date}</td>
                                                    <td>{log.time}</td>
                                                    <td>{log.user}</td>
                                                    <td>{log.action}</td>
                                                    <td style={{
                                                        maxWidth: '300px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {log.details}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    {/* REPORTS AND CALENDAR */}
                    <div className="card-body mt-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {/* REPORTS */}
                            <div style={{ flex: 1, marginRight: '1.25rem' }}>
                                <div className="card" style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    paddingTop: '1.25rem',
                                    border: 'none',
                                    height: '500px'
                                }}>
                                    <div className="d-flex justify-content-between align-items-center px-3 mb-3">
                                        <h5 className="mb-0 header">Reports by Payment Category</h5>
                                    </div>
                                    <div style={{ padding: '0 1rem', height: '400px'}}>
                                        {reportLoading ? (
                                            <LoadingSpinner icon="reports"/> 
                                        ) : reportError ? (
                                            <div className="alert alert-danger">{reportError}</div>
                                        ) : (
                                            <Bar
                                                data={{
                                                    labels: reportData.map(item => item.category),
                                                    datasets: [{
                                                        label: 'Payment Received',
                                                        data: reportData.map(item => item.total),
                                                        backgroundColor: 'rgba(255, 159, 64, 0.8)',
                                                        borderColor: 'rgba(255, 159, 64, 1)',
                                                        borderWidth: 1,
                                                    }]
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'top',
                                                        }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            ticks: {
                                                                callback: function (value) {
                                                                    return '₱' + value.toLocaleString();
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* CALENDAR */}
                            <div style={{ flex: 1 }}>
                                <div className="calendar-card">
                                    <div className="calendar-header">
                                        <h5 className="calendar-title header">Calendar</h5>
                                        <button
                                            className="calendar-add-button"
                                            onClick={handleAddToCalendar}
                                        >
                                            <i className="fas fa-plus me-2"></i>
                                            Add Event
                                        </button>
                                    </div>
                                    <div className="calendar-container">
                                        {calendarLoading ? (
                                            <LoadingSpinner icon="calendar"/> 
                                        ) : (
                                            <iframe
                                                src={CALENDAR_URL}
                                                className="calendar-iframe"
                                                frameBorder="0"
                                                scrolling="no"
                                                title="Admin Calendar"
                                                onLoad={() => setCalendarLoading(false)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* REPORTS AND CALENDAR END */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;