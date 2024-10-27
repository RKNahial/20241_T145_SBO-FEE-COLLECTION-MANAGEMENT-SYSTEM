// src/pages/treasurer/TreasurerReports.jsx
import React, { useState } from "react";
import axios from 'axios'; 
import TreasurerSidebar from "./TreasurerSidebar"; 
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerReports = () => {
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
                    <div className="container-fluid px-4 mb-5">
                        <p className="system-gray mt-4">Welcome back, treasurer!</p>
                        

                        <p>THIS IS TREASURER REPORTS</p>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreasurerReports;