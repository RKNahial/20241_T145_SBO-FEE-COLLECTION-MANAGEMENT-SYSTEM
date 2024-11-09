// src/pages/officer/OfficerAddEvent.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import OfficerSidebar from "./OfficerSidebar"; 
import OfficerNavbar from "./OfficerNavbar";

const OfficerAddEvent = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Officer | Add Event</title>
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
                                        <i className="far fa-plus me-2"></i> <strong>Add New Event</strong>
                                    </div>
                                    <div className="card-body">
                                        <form>
                                            <div className="mb-3">
                                                <label className="mb-1">Event</label>
                                                <input
                                                    type="text"
                                                    className="form-control system"
                                                    placeholder="Enter event"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control system"
                                                    placeholder="Enter start date"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    placeholder="Enter end date"
                                                />
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

export default OfficerAddEvent;