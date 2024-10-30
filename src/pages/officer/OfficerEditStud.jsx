// src/pages/officer/OfficerEditStud.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import OfficerSidebar from "./OfficerSidebar"; 
import OfficerNavbar from "./OfficerNavbar";

const OfficerEditStud = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Officer | Edit Student</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
            <OfficerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <OfficerSidebar isCollapsed={isCollapsed} />
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
                                        <i className="fa-solid fa-pen me-2"></i> <strong>Edit Student</strong>
                                    </div>
                                    <div className="card-body">
                                        <form>
                                            <div className="mb-3">
                                                <label className="mb-1">Student Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control system"
                                                    placeholder="Enter student name"
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
                                            <div className="mb-3">
                                                <label className="mb-1">Address</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="Enter address"
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
                                                <label className="mb-1">Year Level</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    placeholder="Enter year level"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Choose Program</label>
                                                <select className="form-control" defaultValue="">
                                                    <option value="" disabled>Select a program</option>
                                                    <option value="BSIT">BSIT</option>
                                                    <option value="BSEMC">BSEMC</option>
                                                    <option value="BSET">BSET</option>
                                                    <option value="BSAT">BSAT</option>
                                                    <option value="BSFT">BSFT</option>
                                                </select>
                                            </div>
                                            <div className="mb-0">
                                                <button type="submit" className="btn system-button"> <i className="fa-solid fa-pen me-1"></i> Edit</button>
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

export default OfficerEditStud;