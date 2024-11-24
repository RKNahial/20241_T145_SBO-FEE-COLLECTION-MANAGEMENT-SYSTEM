// src/pages/officer/OfficerReports.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import OfficerSidebar from "./OfficerSidebar";
import OfficerNavbar from "./OfficerNavbar";
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
import Preloader from '../../components/Preloader'; 
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const OfficerReports = () => {
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

    // DOWNLOAD REPORT EXCEL
    const handleDownloadReport = () => {
        if (!reportData || reportData.length === 0) {
            alert('No data available to download');
            return;
        }
    
        try {
            let csvData = [];
            let fileName = 'COT-SBO_';
    
            // Prepare CSV data based on report type
            switch (reportType) {
                case 'monthly':
                    if (selectedMonth) {
                        // Single month weekly breakdown
                        const monthData = reportData.find(item => item.month === selectedMonth);
                        fileName += `${selectedMonth}_Weekly_Report`;
                        csvData = [
                            ['Week', 'Total Amount'],
                            ...monthData.weeks.map(week => [
                                week.week,
                                `₱${week.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                            ])
                        ];
                    } else {
                        // All months summary
                        fileName += 'Monthly_Summary_Report';
                        csvData = [
                            ['Month', 'Total Amount'],
                            ...reportData.map(item => [
                                item.month,
                                `₱${item.weeks.reduce((sum, week) => sum + week.total, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                            ])
                        ];
                    }
                    break;
                case 'program':
                    fileName += 'Category_Report';
                    csvData = [
                        ['Category', 'Total Amount'],
                        ...reportData.map(item => [
                            item.category,
                            `₱${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                        ])
                    ];
                    break;
                case 'programTotal':
                    fileName += 'Program_Report';
                    csvData = [
                        ['Program', 'Total Amount'],
                        ...reportData.map(item => [
                            item.program,
                            `₱${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
                        ])
                    ];
                    break;
    
                default:
                    throw new Error('Invalid report type');
            }
    
            // Add total row
            const total = reportData.reduce((sum, item) => {
                if (reportType === 'monthly') {
                    return sum + (selectedMonth 
                        ? item.weeks.reduce((weekSum, week) => weekSum + week.total, 0)
                        : item.weeks.reduce((weekSum, week) => weekSum + week.total, 0));
                }
                return sum + item.total;
            }, 0);
    
            csvData.push(['Total', `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`]);
    
            // Add date to filename
            fileName += `_${new Date().toISOString().split('T')[0]}.csv`;
    
            // Convert to CSV string
            const csvString = csvData
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');
    
            // Create and trigger download
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
    
        } catch (error) {
            console.error('Error generating CSV:', error);
            alert('Failed to generate report');
        }
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Officer | Reports</title>
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
                                            disabled={loading || !reportData.length}
                                        >
                                            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-download'} me-2`}></i>
                                            Download Report
                                        </button>
                                    </div>
                                </div>

                                {loading ? (
                                    <Preloader open={loading} /> // Use Preloader here
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

export default OfficerReports;