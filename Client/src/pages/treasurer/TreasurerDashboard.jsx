// src/pages/treasurer/TreasurerDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import axios from 'axios';
// import { Bar } from 'react-chartjs-2';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import { usePayment } from '../../context/PaymentContext';

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
                console.error('Error fetching active categories:', err);
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

    // REPORTS -- only shows white screen
    // const [reports, setReports] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null); 

    // useEffect(() => {
    //     const fetchReports = async () => {
    //         setLoading(true);
    //         try {
    //             const response = await axios.get('/api/reports');
    //             console.log("Response Data:", response.data);
    //             if (response.data && response.data.length > 0) {
    //                 setReports(response.data);
    //             } else {
    //                 setError("No reports found.");
    //             }
    //         } catch (error) {
    //             console.error("Error fetching reports data:", error);
    //             setError("Failed to fetch reports. Please try again later.");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchReports();
    // }, []);

    // const chartData = {
    //     labels: reports.length > 0 ? reports.map(report => report.title || "Untitled") : ["No Data"],
    //     datasets: [
    //         {
    //             label: 'Report Data',
    //             data: reports.length > 0 ? reports.map(report => report.value || 0) : [0],
    //             backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //             borderColor: 'rgba(255, 99, 132, 1)',
    //             borderWidth: 1,
    //         },
    //     ],
    // };

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

        // Format for millions
        if (amount >= 1000000) {
            return `₱${(amount / 1000000).toFixed(1)}m`;
        }

        // Format for thousands
        if (amount >= 1000) {
            return `₱${(amount / 1000).toFixed(1)}K`;
        }

        // Format regular numbers
        return `₱${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
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
                                            <h5 className="small-text">Total Students</h5>
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
                                            <h5 className="small-text">Active Categories</h5>
                                        </div>
                                        <i className="fas fa-calendar-alt big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text"
                                                onClick={() => setShowFullAmount(!showFullAmount)}
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
                                    <div className="card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingTop: '1.25rem', border: 'none' }}>
                                        {/* REPORTS HERE */}

                                        {/* {loading ? (
                                            <p>Loading reports...</p>
                                        ) : error ? (
                                            <p className="text-danger">{error}</p>
                                        ) : reports.length === 0 ? (
                                            <p>No reports available.</p>
                                        ) : (
                                            <Bar data={chartData} options={{ responsive: true }} />
                                        )} */}
                                    </div>
                                </div>

                                {/* CALENDAR */}
                                <div style={{ flex: 1 }}>
                                    <div className="card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingTop: '1.25rem', border: 'none' }}>
                                        {/*CALENDAR VIEW HERE */}
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