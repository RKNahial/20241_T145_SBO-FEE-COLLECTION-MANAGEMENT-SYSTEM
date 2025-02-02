// src/pages/treasurer/TreasurerReports.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import LoadingSpinner from '../../components/LoadingSpinner';
import jsPDF from 'jspdf'; 
import 'jspdf-autotable';
import axios from 'axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
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
    const [expectedAmounts, setExpectedAmounts] = useState([]);

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

                const [reportResponse, expectedResponse] = await Promise.all([
                    axios.get(`http://localhost:8000/api/payment-fee/${endpoint}`),
                    axios.get('http://localhost:8000/api/payment-fee/reports/expected-amounts')
                ]);

                if (reportResponse.data.success) {
                    setReportData(reportResponse.data.data);
                }
                if (expectedResponse.data.success) {
                    setExpectedAmounts(expectedResponse.data.data);
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

    // DOWNLOAD REPORT AS EXCEL
    const hasData = () => {
        if (!reportData || reportData.length === 0) return false;
        
        switch (reportType) {
            case 'monthly':
                if (selectedMonth) {
                    // Check for specific month's data
                    const monthData = reportData.find(item => item.month === selectedMonth);
                    return monthData && 
                           monthData.weeks && 
                           monthData.weeks.length > 0 && 
                           monthData.weeks.some(week => week.total > 0);
                } else {
                    // Check for any month with data
                    return reportData.some(month => 
                        month.weeks && 
                        month.weeks.length > 0 && 
                        month.weeks.some(week => week.total > 0)
                    );
                }
            
            case 'program':
                return reportData.some(item => item.total > 0);
                
            case 'programTotal':
                return reportData.some(item => item.total > 0);
                
            default:
                return false;
        }
    };

    const handleDownloadExcel = () => {
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
                        const monthData = reportData.find(item => item.month === selectedMonth);
                        if (!monthData) {
                            alert('No data found for the selected month');
                            return;
                        }
                        fileName += `${selectedMonth}_Weekly_Report`;
                        csvData = [
                            ['Week', 'Total Amount'],
                            ...monthData.weeks.map(week => [
                                week.week,
                                `₱${week.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` // Correctly formatted currency
                            ])
                        ];
                    } else {
                        fileName += 'Monthly_Summary_Report';
                        csvData = [
                            ['Month', 'Total Amount'],
                            ...reportData.map(item => [
                                item.month,
                                `₱${item.weeks.reduce((sum, week) => sum + week.total, 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` // Correctly formatted currency
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
                            `₱${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` // Correctly formatted currency
                        ])
                    ];
                    break;
                case 'programTotal':
                    fileName += 'Program_Report';
                    csvData = [
                        ['Program', 'Total Amount'],
                        ...reportData.map(item => [
                            item.program,
                            `₱${item.total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` // Correctly formatted currency
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
    
            csvData.push(['Total', `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`]); // Correctly formatted currency
    
            // Add date to filename
            fileName += `_${new Date().toISOString().split('T')[0]}.csv`;
    
            // Convert to CSV string
            const csvString = csvData
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');
    
            // Add UTF-8 BOM
            const bom = '\uFEFF';
            const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
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

    // Add this function to get appropriate message
    const getNoDataMessage = () => {
        if (!selectedMonth) return "Please select a month";
        if (!reportType) return "Please select a report type";
        return "No data available for the selected criteria";
    };

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
                                {loading ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        minHeight: '300px'  
                                    }}>
                                        <LoadingSpinner icon="reports" /> 
                                    </div>
                                ) : (
                                    <>
                                        {/* Expected Amounts Section */}
                                        <div className="mb-4">
                                            <h5 className="text-center mb-4">Financial Overview</h5>
                                            <div className="row">
                                                <div className="col-md-4 mb-4">
                                                    <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                                                        <Pie 
                                                            data={{
                                                                labels: expectedAmounts.map(category => category.categoryName),
                                                                datasets: [{
                                                                    label: 'Expected Total',
                                                                    data: expectedAmounts.map(category => category.expectedTotal),
                                                                    backgroundColor: [
                                                                        '#4BC0C0',
                                                                        '#36A2EB',
                                                                        '#FFCE56',
                                                                        '#FF6384',
                                                                        '#9966FF',
                                                                        '#FF9F40'
                                                                    ],
                                                                    borderColor: '#fff',
                                                                    borderWidth: 1
                                                                }]
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: {
                                                                        position: 'bottom',
                                                                        labels: {
                                                                            boxWidth: 12
                                                                        }
                                                                    },
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Expected Total by Category'
                                                                    },
                                                                    tooltip: {
                                                                        callbacks: {
                                                                            label: function(context) {
                                                                                const value = context.raw;
                                                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                                const percentage = ((value / total) * 100).toFixed(1);
                                                                                return `₱${value.toLocaleString()} (${percentage}%)`;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-center mt-3">
                                                        <h6>Total Expected: ₱{expectedAmounts.reduce((sum, category) => sum + (category.expectedTotal || 0), 0).toLocaleString()}</h6>
                                                        <div className="small text-muted">
                                                            {expectedAmounts.map((category, index) => {
                                                                const total = expectedAmounts.reduce((sum, cat) => sum + (cat.expectedTotal || 0), 0);
                                                                const percentage = ((category.expectedTotal / total) * 100).toFixed(1);
                                                                return (
                                                                    <div key={index}>
                                                                        {category.categoryName}: ₱{(category.expectedTotal || 0).toLocaleString()} ({percentage}%)
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-4">
                                                    <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                                                        <Pie 
                                                            data={{
                                                                labels: expectedAmounts.map(category => category.categoryName),
                                                                datasets: [{
                                                                    label: 'Actually Received',
                                                                    data: expectedAmounts.map(category => category.actualReceived),
                                                                    backgroundColor: [
                                                                        '#28a745',
                                                                        '#36A2EB',
                                                                        '#FFCE56',
                                                                        '#FF6384',
                                                                        '#9966FF',
                                                                        '#FF9F40'
                                                                    ],
                                                                    borderColor: '#fff',
                                                                    borderWidth: 1
                                                                }]
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: {
                                                                        position: 'bottom',
                                                                        labels: {
                                                                            boxWidth: 12
                                                                        }
                                                                    },
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Payments Received by Category'
                                                                    },
                                                                    tooltip: {
                                                                        callbacks: {
                                                                            label: function(context) {
                                                                                const value = context.raw;
                                                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                                const percentage = ((value / total) * 100).toFixed(1);
                                                                                return `₱${value.toLocaleString()} (${percentage}%)`;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-center mt-3">
                                                        <h6>Total Received: ₱{expectedAmounts.reduce((sum, category) => sum + (category.actualReceived || 0), 0).toLocaleString()}</h6>
                                                        <div className="small text-muted">
                                                            {expectedAmounts.map((category, index) => {
                                                                const total = expectedAmounts.reduce((sum, cat) => sum + (cat.actualReceived || 0), 0);
                                                                const percentage = ((category.actualReceived / total) * 100).toFixed(1);
                                                                return (
                                                                    <div key={index}>
                                                                        {category.categoryName}: ₱{(category.actualReceived || 0).toLocaleString()} ({percentage}%)
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4 mb-4">
                                                    <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                                                        <Pie 
                                                            data={{
                                                                labels: expectedAmounts.map(category => category.categoryName),
                                                                datasets: [{
                                                                    label: 'Remaining Amount',
                                                                    data: expectedAmounts.map(category => category.remainingAmount),
                                                                    backgroundColor: [
                                                                        '#dc3545',
                                                                        '#36A2EB',
                                                                        '#FFCE56',
                                                                        '#FF6384',
                                                                        '#9966FF',
                                                                        '#FF9F40'
                                                                    ],
                                                                    borderColor: '#fff',
                                                                    borderWidth: 1
                                                                }]
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: {
                                                                        position: 'bottom',
                                                                        labels: {
                                                                            boxWidth: 12
                                                                        }
                                                                    },
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Remaining Amount by Category'
                                                                    },
                                                                    tooltip: {
                                                                        callbacks: {
                                                                            label: function(context) {
                                                                                const value = context.raw;
                                                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                                const percentage = ((value / total) * 100).toFixed(1);
                                                                                return `₱${value.toLocaleString()} (${percentage}%)`;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-center mt-3">
                                                        <h6>Total Remaining: ₱{expectedAmounts.reduce((sum, category) => sum + (category.remainingAmount || 0), 0).toLocaleString()}</h6>
                                                        <div className="small text-muted">
                                                            {expectedAmounts.map((category, index) => {
                                                                const total = expectedAmounts.reduce((sum, cat) => sum + (cat.remainingAmount || 0), 0);
                                                                const percentage = total > 0 ? ((category.remainingAmount / total) * 100).toFixed(1) : '0.0';
                                                                return (
                                                                    <div key={index}>
                                                                        {category.categoryName}: ₱{(category.remainingAmount || 0).toLocaleString()} ({percentage}%)
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <h5 className="text-center mb-4">Student Payment Status</h5>
                                            <div className="row">
                                                <div className="col-md-6 mb-4">
                                                    <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                                                        <Pie 
                                                            data={{
                                                                labels: ['Not Paid', 'Partially Paid', 'Fully Paid'],
                                                                datasets: [{
                                                                    label: 'Student Payment Status',
                                                                    data: expectedAmounts.reduce((acc, category) => [
                                                                        acc[0] + (category.unpaidStudents || 0),
                                                                        acc[1] + (category.partiallyPaidStudents || 0),
                                                                        acc[2] + (category.fullyPaidStudents || 0)
                                                                    ], [0, 0, 0]),
                                                                    backgroundColor: [
                                                                        '#dc3545', // Red for Not Paid
                                                                        '#ffc107', // Yellow for Partially Paid
                                                                        '#28a745'  // Green for Fully Paid
                                                                    ],
                                                                    borderColor: '#fff',
                                                                    borderWidth: 1
                                                                }]
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: {
                                                                        position: 'bottom',
                                                                        labels: {
                                                                            boxWidth: 12
                                                                        }
                                                                    },
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Overall Student Payment Status'
                                                                    },
                                                                    tooltip: {
                                                                        callbacks: {
                                                                            label: function(context) {
                                                                                const value = context.raw;
                                                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                                const percentage = ((value / total) * 100).toFixed(1);
                                                                                return `${value} students (${percentage}%)`;
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-center mt-3">
                                                        <h6>Total Students: {expectedAmounts.reduce((sum, category) => sum + category.totalStudents, 0)}</h6>
                                                        <div className="small text-muted">
                                                            <div style={{ color: '#dc3545' }}>
                                                                Not Paid: {expectedAmounts.reduce((sum, category) => sum + (category.unpaidStudents || 0), 0)} students
                                                            </div>
                                                            <div style={{ color: '#ffc107' }}>
                                                                Partially Paid: {expectedAmounts.reduce((sum, category) => sum + (category.partiallyPaidStudents || 0), 0)} students
                                                            </div>
                                                            <div style={{ color: '#28a745' }}>
                                                                Fully Paid: {expectedAmounts.reduce((sum, category) => sum + (category.fullyPaidStudents || 0), 0)} students
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6 mb-4">
                                                    <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                                                        <Pie 
                                                            data={{
                                                                labels: expectedAmounts.map(category => category.categoryName),
                                                                datasets: [{
                                                                    label: 'Students by Category',
                                                                    data: expectedAmounts.map(category => category.totalStudents),
                                                                    backgroundColor: [
                                                                        '#4BC0C0',
                                                                        '#36A2EB',
                                                                        '#FFCE56',
                                                                        '#FF6384',
                                                                        '#9966FF',
                                                                        '#FF9F40'
                                                                    ],
                                                                    borderColor: '#fff',
                                                                    borderWidth: 1
                                                                }]
                                                            }}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: {
                                                                        position: 'bottom',
                                                                        labels: {
                                                                            boxWidth: 12
                                                                        }
                                                                    },
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Students by Category'
                                                                    },
                                                                    tooltip: {
                                                                        callbacks: {
                                                                            label: function(context) {
                                                                                const category = expectedAmounts[context.dataIndex];
                                                                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                                                                return [
                                                                                    `Total: ${category.totalStudents} students (${percentage}%)`,
                                                                                    `Not Paid: ${category.unpaidStudents} students`,
                                                                                    `Partially Paid: ${category.partiallyPaidStudents} students`,
                                                                                    `Fully Paid: ${category.fullyPaidStudents} students`
                                                                                ];
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-center mt-3">
                                                        <h6>Students by Category</h6>
                                                        <div className="small text-muted">
                                                            {expectedAmounts.map((category, index) => (
                                                                <div key={index}>
                                                                    {category.categoryName}: {category.totalStudents} students
                                                                    <div className="ms-3">
                                                                        <span style={{ color: '#dc3545' }}>Not Paid: {category.unpaidStudents}</span> | 
                                                                        <span style={{ color: '#ffc107' }}> Partially Paid: {category.partiallyPaidStudents}</span> | 
                                                                        <span style={{ color: '#28a745' }}> Fully Paid: {category.fullyPaidStudents}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

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
                                                    className="add-button btn btn-sm me-2"
                                                    onClick={handleDownloadExcel}
                                                >
                                                    <i className="fas fa-file-excel me-2"></i>
                                                    Download Excel
                                                </button>
                                                {/* SUPPOSEDLY FOR PDF */}
                                                {/* <button
                                                    className="add-button btn btn-sm me-2"
                                                    onClick={handleDownloadPDF}
                                                >
                                                    <i className="fas fa-file-pdf me-2"></i>
                                                    Download PDF
                                                </button> */}
                                            </div>
                                        </div>

                                        <div style={{ height: '400px' }}>
                                            <Bar data={chartData} options={options} />
                                        </div>
                                    </>
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

<style>
    {`
        .alert {
            margin-top: 1rem;
            margin-bottom: 1rem;
            padding: 0.75rem;
            border-radius: 0.25rem;
        }
        
        .alert-info {
            background-color: #e8f4f8;
            border-color: #bee5eb;
            color: #0c5460;
        }
    `}
</style>