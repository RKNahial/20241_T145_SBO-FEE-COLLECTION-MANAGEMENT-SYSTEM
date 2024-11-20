// src/pages/admin/AdminDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import axios from 'axios';

const AdminDashboard = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [totalActiveStudents, setTotalActiveStudents] = useState(0);
    const [totalActiveOfficers, setTotalActiveOfficers] = useState(0);
    const [totalAdmins, setTotalAdmins] = useState(0);
    const [totalSchoolYears, setTotalSchoolYears] = useState(0);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Format large numbers with commas
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch all counts in parallel
                const [studentsRes, officersRes, adminsRes, schoolYearsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/admin/students/active/count', { headers }),
                    axios.get('http://localhost:8000/api/admin/officers/active/count', { headers }),
                    axios.get('http://localhost:8000/api/admin/admins/count', { headers }),
                    axios.get('http://localhost:8000/api/admin/school-years/count', { headers })
                ]);

                setTotalActiveStudents(studentsRes.data.count || 0);
                setTotalActiveOfficers(officersRes.data.count || 0);
                setTotalAdmins(adminsRes.data.count || 0);
                setTotalSchoolYears(schoolYearsRes.data.count || 0);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

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
                    <div className="container-fluid px-5 mb-5">
                        <p className="system-gray mt-4 welcome-text">Welcome back, admin!</p>

                        {/* ORANGE CARDS */}
                        <div className="row">
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">{formatNumber(totalActiveStudents)}</h2>
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
                                            <h2 className="big-text">{formatNumber(totalActiveOfficers)}</h2>
                                            <h5 className="small-text">Active Officers</h5>
                                        </div>
                                        <i className="fas fa-user-tie big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">{formatNumber(totalAdmins)}</h2>
                                            <h5 className="small-text">Total Admins</h5>
                                        </div>
                                        <i className="fas fa-user-shield big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">{formatNumber(totalSchoolYears)}</h2>
                                            <h5 className="small-text">School Years</h5>
                                        </div>
                                        <i className="fas fa-calendar-alt big-icon text-white"></i>
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

export default AdminDashboard;