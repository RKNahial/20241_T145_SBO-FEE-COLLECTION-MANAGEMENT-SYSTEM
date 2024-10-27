// src/pages/treasurer/TreasurerProfile.jsx
import React, { useState } from "react";
import axios from 'axios'; 
import TreasurerSidebar from "./TreasurerSidebar"; 
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerProfile = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className="sb-nav-fixed">
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
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
                    <div className="container-fluid px-4">
                        <h5 className="mt-4 mb-3">My Profile</h5>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="fas fa-user-edit"></i> <span style={{ paddingLeft: '0.50rem', fontWeight: 'bold' }}>Edit Profile</span>
                                    </div>
                                    <div className="card-body">
                                        <form>
                                            <div className="mb-3">
                                                <label className="mb-1">User Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control system"
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="Enter your email"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Password</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    placeholder="Enter your password"
                                                />
                                            </div>
                                            <div className="mb-0">
                                                <button type="submit" className="btn system-button">Edit</button>
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

export default TreasurerProfile;