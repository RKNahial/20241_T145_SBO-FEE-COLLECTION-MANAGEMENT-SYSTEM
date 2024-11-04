// src/pages/admin/AdminAddOfficer.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar"; 
import AdminNavbar from "./AdminNavbar";

const AdminAddOfficer = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Add Student</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
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
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="far fa-plus me-2"></i> <strong>Add New Officer</strong>
                                    </div>
                                    <div className="card-body">
                                        <form>
                                            <div className="mb-3">
                                                <label className="mb-1">Officer Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control system"
                                                    placeholder="Enter officer name"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Student ID</label>
                                                <input
                                                    type="text"
                                                    className="form-control system"
                                                    placeholder="Enter student ID"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Institutional Email</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    placeholder="Enter institutional email"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Choose Position</label>
                                                <select className="form-control form-select" defaultValue="">
                                                    <option value="" disabled>Select a position</option>
                                                    <option value="Governor">Governor</option>
                                                    <option value="Governor">Governor</option>
                                                    
                                                </select>
                                            </div>
                                            <div className="mb-0">
                                                <button type="submit" className="btn system-button"> <i className="far fa-plus me-1"></i> Add</button>
                                            </div>
                                        </form>
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

export default AdminAddOfficer;