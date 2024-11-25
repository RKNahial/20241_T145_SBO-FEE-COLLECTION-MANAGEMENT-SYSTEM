// src/pages/treasurer/TreasurerReports.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TreasurerReports = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const [reportType, setReportType] = useState('monthly');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('');

    // NEW: Add state for user permissions
    const [userPermissions, setUserPermissions] = useState({
        updateStudent: 'denied',
        archiveStudent: 'denied'
    });

    useEffect(() => {
        const fetchReportData = async () => {
            setLoading(true);
            try {
                let endpoint = '';
                switch (reportType) {
                    case 'monthly':
                        endpoint = 'reports';
                        break;
                    case 'program':
                        endpoint = 'reports/by-program';
                        break;
                    case 'programTotal':
                        endpoint = 'reports/by-program-total';
                        break;
                    default:
                        endpoint = 'reports';
                }

                const response = await axios.get(`http://localhost:8000/api/payment-fee/${endpoint}`);
                if (response.data.success) {
                    setReportData(response.data.data);
                }
            } catch (err) {
                setError('Failed to fetch report data');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [reportType]);

    // NEW: Fetch user permissions
    useEffect(() => {
        const fetchUserPermissions = async () => {
            try {
                const userDetailsString = localStorage.getItem('userDetails');
                if (!userDetailsString) {
                    console.warn('No user details found in localStorage');
                    return;
                }

                const userDetails = JSON.parse(userDetailsString);
                if (!userDetails._id) {
                    console.warn('No user ID found in user details');
                    return;
                }

                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `http://localhost:8000/api/permissions/${userDetails._id}`,
                    {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : undefined
                        }
                    }
                );

                if (response.data && response.data.data) {
                    setUserPermissions({
                        updateStudent: response.data.data.updateStudent || 'denied',
                        archiveStudent: response.data.data.archiveStudent || 'denied'
                    });
                }
            } catch (error) {
                console.error('Error fetching user permissions:', error);
                // Set default permissions on error
                setUserPermissions({
                    updateStudent: 'denied',
                    archiveStudent: 'denied'
                });
            }
        };

        fetchUserPermissions();
    }, []);

    // NEW: Helper method to check if a specific action is allowed
    const isActionAllowed = (action) => {
        return userPermissions[action] === 'view' || userPermissions[action] === 'edit';
    };

    const chartData = {
        labels: reportType === 'monthly'
            ? (selectedMonth
                ? reportData.find(item => item.month === selectedMonth)?.weeks?.map(w => w.week) || []
                : reportData.map(item => item.month))
            : reportType === 'programTotal'
                ? reportData.map(item => item.program)
                : reportData.map(item => item.category),
        datasets: [
            {
                label: 'Payment Received',
                data: reportType === 'monthly'
                    ? (selectedMonth
                        ? reportData.find(item => item.month === selectedMonth)?.weeks?.map(w => w.total) || []
                        : reportData.map(item => {
                            const weeks = item.weeks || [];
                            return weeks.reduce((sum, week) => sum + (week.total || 0), 0);
                        }))
                    : reportType === 'programTotal'
                        ? reportData.map(item => item.total)
                        : reportData.map(item => item.total),
                backgroundColor: 'rgba(255, 159, 64, 0.8)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Payment Reports',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return '₱' + value.toLocaleString();
                    }
                }
            }
        }
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
        link.setAttribute('download', 'COT-SBO Report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    // -------------------------------------------------------------------------------------------//

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Reports</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
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
                                <div className="d-flex justify-content-start mb-3">
                                    <div className="d-flex align-items-center">
                                        <label className="me-2 mb-0">Select Reports</label>
                                        <div className="dashboard-select" style={{ width: 'auto' }}>
                                            <select
                                                className="form-control"
                                                value={reportType}
                                                onChange={(e) => setReportType(e.target.value)}
                                            >
                                                <option value="monthly">Monthly Report</option>
                                                <option value="program">Report by Categories</option>
                                                <option value="programTotal">Report by Program</option>
                                            </select>
                                        </div>
                                    </div>

                                    {reportType === 'monthly' && (
                                        <div className="d-flex align-items-center ms-3">
                                            <label className="me-2 mb-0">Select Month</label>
                                            <div className="dashboard-select" style={{ width: 'auto' }}>
                                                <select
                                                    className="form-control"
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                                >
                                                    <option key="all" value="">All Months</option>
                                                    {reportData.map(item => (
                                                        <option key={item.month} value={item.month}>
                                                            {item.month}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div className="ms-auto">
                                        <button
                                            className="add-button btn btn-sm"
                                            onClick={handleDownloadReport}
                                        >
                                            <i className="fas fa-download me-2"></i>
                                            Download Report
                                        </button>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="text-center">Loading...</div>
                                ) : error ? (
                                    <div className="alert alert-danger">{error}</div>
                                ) : (
                                    <div style={{ height: '400px' }}>
                                        <Bar data={chartData} options={options} />
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default TreasurerReports;