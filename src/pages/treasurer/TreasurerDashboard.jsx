// src/pages/treasurer/TreasurerDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState } from "react";
// import { Bar } from 'react-chartjs-2';
import TreasurerSidebar from "./TreasurerSidebar"; 
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerDashboard = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

     // Sample data for demonstration only
     const students = [
        {
            id: 1,
            date: 'October 10, 2024',
            ref_no: 'PAY20241010-001',
            id_no: '2101101369',
            name: 'Jessler Hilario',
            paid_amount: '200.00',
        },
        {
            id: 2,
            date: 'October 10, 2024',
            ref_no: 'PAY20241010-001',
            id_no: '2101105798',
            name: 'Vince Andrew Escoto',
            paid_amount: '200.00',
        },
        {
            id: 3,
            date: 'October 7, 2024',
            ref_no: 'PAY2024107-001',
            id_no: '2101105721',
            name: 'Kirk John Tado',
            paid_amount: '200.00',
        },
        {
            id: 4,
            date: 'October 7, 2024',
            ref_no: 'PAY2024107-001',
            id_no: '2101103332',
            name: 'Melany Gunayan',
            paid_amount: '200.00',
        },
        {
            id: 5,
            date: 'October 5, 2024',
            ref_no: 'PAY2024105-001',
            id_no: '2101103307',
            name: 'Leanne Mae Reyes',
            paid_amount: '200.00',
        }
    ];

    // REPORTS -- only shows white screen
    // const [reports, setReports] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(null); 

    // useEffect(() => {
    //     const fetchReports = async () => {
    //         setLoading(true);
    //         try {
    //             const response = await axios.get('/api/reports');
    //             console.log("Response Data:", response.data);
    //             if (response.data && response.data.length > 0) {
    //                 setReports(response.data);
    //             } else {
    //                 setError("No reports found.");
    //             }
    //         } catch (error) {
    //             console.error("Error fetching reports data:", error);
    //             setError("Failed to fetch reports. Please try again later.");
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    
    //     fetchReports();
    // }, []);

    // const chartData = {
    //     labels: reports.length > 0 ? reports.map(report => report.title || "Untitled") : ["No Data"],
    //     datasets: [
    //         {
    //             label: 'Report Data',
    //             data: reports.length > 0 ? reports.map(report => report.value || 0) : [0],
    //             backgroundColor: 'rgba(255, 99, 132, 0.2)',
    //             borderColor: 'rgba(255, 99, 132, 1)',
    //             borderWidth: 1,
    //         },
    //     ],
    // };


    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Dashboard</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
                <div 
                    id="layoutSidenav_content" 
                    style={{ 
                        marginLeft: isCollapsed ? '5rem' : '15.625rem',
                        marginRight: '0rem',
                        transition: 'margin-left 0.3s',
                        flexGrow: 1,
                        marginTop: '3.5rem' 
                    }}
                >
                    {/* CONTENT */}
                    <div className="container-fluid px-5 mb-5">
                        <p className="system-gray mt-4 welcome-text">Welcome back, treasurer!</p>
                        
                        {/* ORANGE CARDS */}
                        <div className="row">
                            <div className="col-xl-3 col-md-6"> 
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">2378</h2>
                                            <h5 className="small-text">Total Students</h5>
                                        </div>
                                        <i className="fas fa-user-graduate big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">36</h2>
                                            <h5 className="small-text">Total Officers</h5>
                                        </div>
                                        <i className="fas fa-user-tie big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">3</h2>
                                            <h5 className="small-text">Total Events</h5>
                                        </div>
                                        <i className="fas fa-calendar-alt big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-md-6">
                                <div className="card orange-card mb-4">
                                    <div className="card-body d-flex justify-content-between align-items-center">
                                        <div>
                                            <h2 className="big-text">
                                                <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>&#8369;</span>5674
                                            </h2>
                                            <h5 className="small-text">Total Fees Received</h5>
                                        </div>
                                        <i className="fas fa-money-bill-wave big-icon text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="card-body">
                            <h5 className="mb-4 header">Recent Payments</h5>
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Date</th>
                                        <th>Ref. No</th>
                                        <th>Student ID</th>
                                        <th>Student Name</th>
                                        <th>Paid Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student, index) => (
                                        <tr key={student.id}>
                                            <td>{index + 1}</td>
                                            <td>{student.date}</td>
                                            <td>{student.ref_no}</td>
                                            <td>{student.id_no}</td>
                                            <td>{student.name}</td>
                                            <td>{student.paid_amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* TABLE ENDS */}

                        {/* REPORTS AND CALENDAR */}
                        <div className="card-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {/* REPORTS */}
                                <div style={{ flex: 1, marginRight: '1.25rem' }}>
                                    <div className="card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingTop: '1.25rem', border: 'none' }}>
                                        <p>REPORTS HERE (Dili siya ga-work huhu)</p>
                                        <p>Bar Graph daw ni</p>
                                        {/* {loading ? (
                                            <p>Loading reports...</p>
                                        ) : error ? (
                                            <p className="text-danger">{error}</p>
                                        ) : reports.length === 0 ? (
                                            <p>No reports available.</p>
                                        ) : (
                                            <Bar data={chartData} options={{ responsive: true }} />
                                        )} */}
                                    </div>
                                </div>

                                {/* CALENDAR */}
                                <div style={{ flex: 1 }}>
                                    <div className="card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', paddingTop: '1.25rem', border: 'none' }}>
                                        {/* <CalendarView /> */}
                                        <p>INSERT CALENDAR VIEW HERE</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                        {/* REPORTS AND CALENDAR END */}

                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreasurerDashboard;