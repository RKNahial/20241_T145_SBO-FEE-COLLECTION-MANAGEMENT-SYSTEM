// src/pages/treasurer/TreasurerReports.jsx
import React, { useState } from "react";
import OfficerSidebar from "./OfficerSidebar"; 
import OfficerNavbar from "./OfficerNavbar";

const OfficerReports = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // -------------------------------------------------------------------------------------------//
    // DOWNLOAD REPORT (SAMPLE ONLY)
    const handleDownloadReport = () => {
        const reportData = [
            { id: '1901104188', name: 'Mary Joy Alonzo', year: '4th Year', program: 'BSIT' },
            { id: '2101102924', name: 'Jonathan Cruz', year: '4th Year', program: 'BSIT' },
            // Add more student data as needed
        ];

        // Convert to CSV
        const csvContent = [
            ["Student ID", "Student Name", "Year Level", "Program"],
            ...reportData.map(student => [student.id, student.name, student.year, student.program])
        ]
            .map(e => e.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    // -------------------------------------------------------------------------------------------//

    return (
        <div className="sb-nav-fixed">
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
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <i className="far fa-file-alt me-2"></i> <strong>Reports</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                {/* SELECT REPORT CATEGORY */}
                                <div className="d-flex justify-content-between mb-3">
                                    <div className="d-flex align-items-center">
                                        <label className="me-2 mb-0">Select Category</label>
                                        <div style={{ width: 'auto' }}>
                                            <select className="form-control" defaultValue="">
                                                <option value="" disabled>Select a category</option>
                                                <option value="College Shirt">Monthly Report</option>
                                                <option value="Events">Report by Program</option>
                                                <option value="Events">Report by Payment Category</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <button 
                                            className="add-button btn btn-sm" 
                                            onClick={handleDownloadReport}
                                        >
                                            <i className="fas fa-download me-2"></i>
                                            Download Report
                                        </button>
                                    </div>
                                </div>

                                <p>BAR GRAPH HERE</p>

                            </div>
                        </div>
                    </div>

                    
                </div> 
            </div>
        </div>
    );
};

export default OfficerReports;