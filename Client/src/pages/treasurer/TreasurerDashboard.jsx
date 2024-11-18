// src/pages/treasurer/TreasurerDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
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
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import { usePayment } from '../../context/PaymentContext';
import '../../assets/css/calendar.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TreasurerDashboard = () => {
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
                const response = await axios.get('http://localhost:8000/api/getAll/students');
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
        const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/eventedit?cid=c_24e4973e704b983a944d5bc4cd1a7e0437d3eb519a1935d01706fb81909b68d3@group.calendar.google.com';
        window.open(calendarUrl, '_blank');
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Dashboard</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
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
                        <p className="system-gray mt-4 welcome-text">Welcome back, treasurer!</p>

                        {/* ORANGE CARDS */}
                        <div className="row">
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">{totalActiveStudents}</h2>
                                            <h5 className="small-text">Active Students</h5>
                                        </div>
                                        <i className="fas fa-user-graduate big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">36</h2>
                                            <h5 className="small-text">Total Officers</h5>
                                        </div>
                                        <i className="fas fa-user-tie big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">{activeCategories}</h2>
                                            <h5 className="small-text">Payment Categories</h5>
                                        </div>
                                        <i className="fas fa-wallet big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text"
                                                // onClick={() => setShowFullAmount(!showFullAmount)}
                                                style={{ cursor: 'pointer' }}>
                                                <span style={{
                                                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                                                }}></span>
                                                {formatAmount(totalFees)}
                                            </h2>
                                            <h5 className="small-text">Total Fees Received</h5>
                                        </div>
                                        <i className="fas fa-money-bill-wave big-icon text-white"></i>
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
                                        <th>#</th>
                                        <th>Date</th>
                                        <th>Category ID</th>
                                        <th>Student ID</th>
                                        <th>Student Name</th>
                                        <th>Paid Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center">Loading...</td>
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
                                                <td>{payment.categoryId}</td>
                                                <td>{payment.studentId}</td>
                                                <td>{payment.studentName}</td>
                                                <td>₱{payment.paidAmount.toFixed(2)}</td>
                                            </tr>
                                        ))
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
                                            <h5 className="mb-0 header">Payment Reports by Program</h5>
                                        </div>
                                        <div style={{ padding: '0 1rem', height: '400px' }}>
                                            {reportLoading ? (
                                                <div className="text-center">Loading...</div>
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
                                <div style={{ flex: 1}}>
                                    <div className="calendar-card" style={{ boxShadow: 'none' }}>
                                        <div className="calendar-header header">
                                            <h5 className="calendar-title">Calendar</h5>
                                            <button
                                                className="add-button"
                                                onClick={handleAddToCalendar}
                                            >
                                                <i className="fas fa-plus me-2"></i>
                                                Add Event
                                            </button>
                                        </div>
                                        <div className="calendar-container">
                                            <iframe
                                                src="https://calendar.google.com/calendar/embed?src=c_24e4973e704b983a944d5bc4cd1a7e0437d3eb519a1935d01706fb81909b68d3%40group.calendar.google.com&ctz=UTC"
                                                className="calendar-iframe"

                                                title="Treasurer Calendar"
                                            />
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

export default TreasurerDashboard;