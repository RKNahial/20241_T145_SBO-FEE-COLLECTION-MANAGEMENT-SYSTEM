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

                        {/* REPORTS AND CALENDAR */}
                        <div className="card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {/* REPORTS */}
                                <div style={{ flex: 1, marginRight: '1.25rem' }}>
                                    <div className="card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingTop: '1.25rem', border: 'none' }}>
                                        <p>REPORTS HERE (Dili siya ga-work huhu)</p>
                                        <p>Bar Graph daw ni</p>
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
                                        {/* <CalendarView /> */}
                                        <p>INSERT CALENDAR VIEW HERE</p>
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