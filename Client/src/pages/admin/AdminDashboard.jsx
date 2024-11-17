// src/pages/admin/AdminDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import axios from 'axios';

const AdminDashboard = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentPayments = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/payment/recent-payments');
                if (response.data.success) {
                    setRecentPayments(response.data.payments);
                }
            } catch (err) {
                setError('Failed to fetch recent payments');
                console.error('Error fetching recent payments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentPayments();
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Sample data for demonstration only
    const students = [
        {
            id: 1,
            date: 'October 10, 2024',
            ref_no: 'PAY20241010-001',
            id_no: '2101101369',
            name: 'Jessler Hilario',
            paid_amount: '200.00',
        },
        {
            id: 2,
            date: 'October 10, 2024',
            ref_no: 'PAY20241010-001',
            id_no: '2101105798',
            name: 'Vince Andrew Escoto',
            paid_amount: '200.00',
        },
        {
            id: 3,
            date: 'October 7, 2024',
            ref_no: 'PAY2024107-001',
            id_no: '2101105721',
            name: 'Kirk John Tado',
            paid_amount: '200.00',
        },
        {
            id: 4,
            date: 'October 7, 2024',
            ref_no: 'PAY2024107-001',
            id_no: '2101103332',
            name: 'Melany Gunayan',
            paid_amount: '200.00',
        },
        {
            id: 5,
            date: 'October 5, 2024',
            ref_no: 'PAY2024105-001',
            id_no: '2101103307',
            name: 'Leanne Mae Reyes',
            paid_amount: '200.00',
        }
    ];

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Dashboard</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
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
                        <p className="system-gray mt-4 welcome-text">Welcome back, admin!</p>

                        {/* ORANGE CARDS */}
                        <div className="row">
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">2378</h2>
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
                                            <h2 className="big-text">3</h2>
                                            <h5 className="small-text">Total Events</h5>
                                        </div>
                                        <i className="fas fa-calendar-alt big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">
                                                <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>&#8369;</span>5674
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

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;