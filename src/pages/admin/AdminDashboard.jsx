// src/pages/admin/AdminDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar"; 
import AdminNavbar from "./AdminNavbar";

const AdminDashboard = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);

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
                                        <th>Ref. No</th>
                                        <th>Student ID</th>
                                        <th>Student Name</th>
                                        <th>Paid Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => (
                                        <tr key={student.id}>
                                            <td>{index + 1}</td>
                                            <td>{student.date}</td>
                                            <td>{student.ref_no}</td>
                                            <td>{student.id_no}</td>
                                            <td>{student.name}</td>
                                            <td>{student.paid_amount}</td>
                                        </tr>
                                    ))}
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