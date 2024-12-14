// src/pages/Gov/GovDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from 'axios';
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
import GovSidebar from "./GovSidebar";
import GovNavbar from "./GovNavbar";
import { usePayment } from '../../context/PaymentContext';
import '../../assets/css/calendar.css';
import { getAnalytics, logEvent } from "firebase/analytics";
import { app } from '../firebase/firebaseConfig';
import LoadingSpinner from '../../components/LoadingSpinner'; 

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

const GovDashboard = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { paymentUpdate } = usePayment();
    const [totalFees, setTotalFees] = useState(0);
    const [showFullAmount, setShowFullAmount] = useState(false);
    const [activeCategories, setActiveCategories] = useState(0);
    const [totalActiveStudents, setTotalActiveStudents] = useState(0);
    const [reportType, setReportType] = useState('program');
    const [reportData, setReportData] = useState([]);
    const [reportLoading, setReportLoading] = useState(true);
    const [reportError, setReportError] = useState(null);
    const [showCelebration, setShowCelebration] = useState(() => {
        const shouldShow = localStorage.getItem('showLoginCelebration') === 'true';
        if (shouldShow) {
            localStorage.removeItem('showLoginCelebration');
        }
        return shouldShow;
    });
    const [totalActiveOfficers, setTotalActiveOfficers] = useState(0);

    // Add analytics initialization
    const analytics = getAnalytics(app);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

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
                if (err.response?.status === 401) {
                    // Handle unauthorized access
                    console.log('Unauthorized access. Please login again.');
                }
            }
        };

        fetchTotalActiveStudents();
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

    useEffect(() => {
        logEvent(analytics, 'page_view', {
            page_title: 'Gov Dashboard',
            page_location: window.location.href,
            page_path: window.location.pathname,
            user_role: 'Gov'
        });
    }, []);

    useEffect(() => {
        const fetchTotalActiveOfficers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8000/api/officials', {
                    headers: { Authorization: `Bearer ${token}` }
                });
    
                // Count active officials (officers, treasurers, and governors)
                const activeOfficials = response.data.data.filter(official => 
                    !official.isArchived && 
                    ['officer', 'treasurer', 'governor'].includes(official.position?.toLowerCase())
                ).length;
    
                setTotalActiveOfficers(activeOfficials);
            } catch (err) {
                console.error('Error fetching total active officers:', err);
            }
        };
    
        fetchTotalActiveOfficers();
    }, []);

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

    const handleAddToCalendar = () => {
        const addEventUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?cid=${encodeURIComponent(CALENDAR_ID)}`;
        window.open(addEventUrl, '_blank');
    };

    const [calendarLoading, setCalendarLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCalendarLoading(false);
        }, 1500); 

        return () => clearTimeout(timer);
    }, []);

    const actionButtonStyle = {
        width: '35px',
        height: '35px',
        padding: '0',
        margin: '0 4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        border: 'none',
        transition: 'all 0.2s ease',
    };

    return (
        <div className="sb-nav-fixed">
            <style>
                {`
                    .table-hover .no-hover:hover {
                        background-color: transparent !important;
                    }
                    .pagination .page-item.active .page-link {
                        background-color: #ff7f00 !important; /* Set to orange */
                        border-color: #ff7f00 !important;
                    }
                `}
            </style>
            {showCelebration && <LoginCelebration />}
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
                    <div className="container-fluid px-5 mb-5">
                        <p className="system-gray mt-4 welcome-text">Welcome back, Governor!</p>

                        {/* ORANGE CARDS */}
                        <div className="row">
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
                                            <p className="mb-0 text-white">Total Officers</p>
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
                                                <i className="fas fa-list-alt fa-lg text-white"></i>
                                            </div>
                                            <h5 className="mb-1 fw-bold text-white">{activeCategories}</h5>
                                            <p className="mb-0 text-white">Payment Categories</p>
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

                        {/* TABLE */}
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
                                    recentPayments.map((payment, index) => {
                                        const timestamp = new Date(payment.date);
                                        return (
                                            <tr key={payment.id}>
                                                <td>{index + 1}</td>
                                                <td>{timestamp.toLocaleDateString('en-PH', {
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                })}</td>
                                                <td>{payment.paymentTime}</td>
                                                <td>{payment.categoryName}</td>
                                                <td>{payment.studentName}</td>
                                                <td>₱{payment.paidAmount.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            </table>
                        </div>
                        {/* TABLE ENDS */}

                        {/* REPORTS AND CALENDAR */}
                        <div className="card-body">
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
                                            <LoadingSpinner  icon="reports"/> 
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
                                                title="Gov Calendar"
                                                onLoad={() => setCalendarLoading(false)}  // Add this handler
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

export default GovDashboard;