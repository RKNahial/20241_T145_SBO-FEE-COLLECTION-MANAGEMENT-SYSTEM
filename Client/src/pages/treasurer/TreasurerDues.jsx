import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from '../../components/LoadingSpinner';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import axios from 'axios';

const TreasurerDues = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedWeek, setSelectedWeek] = useState(Math.ceil(new Date().getDate() / 7).toString());
    const itemsPerPage = 10;

    const navigate = useNavigate();
    const location = useLocation();

    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userPermissions, setUserPermissions] = useState({
        toggleDuesPayment: 'denied',
        duesPayment: 'denied'
    });

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
        setCurrentPage(1); 
    };

    const handleWeekChange = (e) => {
        setSelectedWeek(e.target.value);
        setCurrentPage(1); 
    };

    // Calculate pagination values
    const indexOfLastOfficer = currentPage * itemsPerPage;
    const indexOfFirstOfficer = indexOfLastOfficer - itemsPerPage;
    const currentOfficers = officers.slice(indexOfFirstOfficer, indexOfLastOfficer);
    const totalPages = Math.ceil(officers.length / itemsPerPage);

    // Generate dates for the selected week
    const dates = ['Monday', 'Tuesday', 'Thursday', 'Friday']

    // Function to determine the number of weeks in a month
    const getWeeksInMonth = (month) => {
        const currentYear = new Date().getFullYear(); 
        const monthIndex = new Date(Date.parse(month + " 1, " + currentYear)).getMonth(); 
        const firstDay = new Date(currentYear, monthIndex, 1);
        const lastDay = new Date(currentYear, monthIndex + 1, 0); 
        const totalDays = lastDay.getDate();
        return Math.ceil(totalDays / 7); 
    };

    // Get the number of weeks for the selected month
    const weeksInMonth = getWeeksInMonth(selectedMonth);
    const weekOptions = Array.from({ length: weeksInMonth }, (_, index) => index + 1);

    // const PaymentStatusTag = React.memo(({ status, onToggle }) => {
    //     return (
    //         <button
    //             onClick={onToggle}
    //             className={`btn btn-sm ${status === 'Paid' ? 'paid' : 'not-paid'}`}
    //             style={{
    //                 backgroundColor: status === 'Paid' ? '#FF8C00' : '#FFB84D',
    //                 color: '#EAEAEA',
    //                 border: 'none',
    //                 padding: '0.25rem 0.75rem',
    //                 borderRadius: '0.60rem',
    //                 fontSize: '0.75rem',
    //                 fontWeight: 500,
    //                 display: 'inline-block'
    //             }}
    //         >
    //             {status}
    //         </button>
    //     );
    // });

    // First, modify the PaymentStatusTag component to handle local state
    const PaymentStatusTag = React.memo(({ initialStatus, onToggle }) => {
        const [status, setStatus] = useState(initialStatus);

        const handleClick = () => {
            const newStatus = status === 'Paid' ? 'Not Paid' : 'Paid';
            setStatus(newStatus);
            onToggle?.(newStatus);  // Optional callback if you want to keep track in parent
        };

        return (
            <button
                onClick={handleClick}
                className={`btn btn-sm ${status === 'Paid' ? 'paid' : 'not-paid'}`}
                disabled={userPermissions.toggleDuesPayment !== 'edit'}
                style={{
                    backgroundColor: status === 'Paid' ? '#FF8C00' : '#FFD700', // Bold Orange for Paid, Light Orange for Unpaid
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.60rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold', // Make the font bold
                    display: 'inline-block',
                    cursor: userPermissions.toggleDuesPayment === 'edit' ? 'pointer' : 'not-allowed',
                    opacity: userPermissions.toggleDuesPayment === 'edit' ? 1 : 0.7,
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                {status}
            </button>
        );
    });

    // Then, modify how you use the PaymentStatusTag in the table
    const handleStatusToggle = async (userId, day, currentStatus) => {
        if (userPermissions.toggleDuesPayment !== 'edit') {
            setError('You do not have permission to toggle dues payment status');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'Paid' ? 'Not Paid' : 'Paid';

            const response = await fetch(`http://localhost:8000/api/daily-dues/${userId}/toggle`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    month: selectedMonth,
                    week: selectedWeek,
                    day,
                    newStatus
                })
            });

            if (response.ok) {
                await axios.post(
                    'http://localhost:8000/api/history-logs/dues-toggle',
                    {
                        userId,
                        duesDetails: {
                            month: selectedMonth,
                            week: selectedWeek,
                            day,
                            previousStatus: currentStatus,
                            newStatus
                        }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                refreshData();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update payment status');
            }
        } catch (error) {
            console.error('Error toggling payment status:', error);
            setError('Failed to update payment status');
        }
    };

    const refreshData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/api/daily-dues?month=${selectedMonth}&week=${selectedWeek}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch dues');
            const data = await response.json();
            setOfficers([...data]);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching dues:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserPermissions = async () => {
            try {
                const token = localStorage.getItem('token');
                const userDetails = JSON.parse(localStorage.getItem('userDetails'));

                const response = await axios.get(
                    `http://localhost:8000/api/permissions/${userDetails._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data && response.data.data) {
                    setUserPermissions({
                        toggleDuesPayment: response.data.data.toggleDuesPayment || 'denied',
                        duesPayment: response.data.data.duesPayment || 'denied'
                    });
                }
            } catch (error) {
                console.error('Error fetching user permissions:', error);
            }
        };

        fetchUserPermissions();
    }, []);

    useEffect(() => {
        let isMounted = true;
        const fetchDues = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8000/api/daily-dues?month=${selectedMonth}&week=${selectedWeek}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                if (!response.ok) throw new Error('Failed to fetch dues');
                const data = await response.json();

                if (isMounted) {
                    // Filter only active officers, treasurers, and governors
                    const filteredData = data.filter(user => 
                        !user.isArchived && 
                        ['Officer', 'Treasurer', 'Governor'].includes(user.userType)
                    );
                    setOfficers(filteredData);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                    console.error('Error fetching dues:', err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (token) {
            fetchDues();
        } else {
            navigate('/login');
        }

        return () => {
            isMounted = false;
        };
    }, [selectedMonth, selectedWeek, location.state?.timestamp, token, navigate]);

    // Add this effect to handle refresh from location state
    useEffect(() => {
        if (location.state?.refresh) {
            // Update selected month and week if provided
            if (location.state.month) {
                setSelectedMonth(location.state.month);
            }
            if (location.state.week) {
                setSelectedWeek(location.state.week);
            }
            refreshData();
        }
    }, [location.state]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="sb-nav-fixed">
            <style>
                {`
                    .pagination .page-item.active .page-link {
                        background-color: #ff7f00 !important;
                        border-color: #ff7f00 !important;
                        color: white !important;
                    }
                `}
            </style>
            <Helmet>
                <title>Treasurer | Daily Dues</title>
            </Helmet>
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    transition: 'margin-left 0.3s',
                    flexGrow: 1,
                    marginTop: '3.5rem'
                }}>
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="card mb-4">
                            <div className="card-header">
                                <strong><i className="fas fa-coins me-2"></i>Daily Dues</strong>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        minHeight: '300px'
                                    }}>
                                        <LoadingSpinner icon="coin" />
                                    </div>
                                ) : (
                                    <React.Fragment>
                                        <div className="d-flex justify-content-start mb-3">
                                            <div className="d-flex align-items-center me-3">
                                                <label className="me-2 mb-0">Select Month</label>
                                                <div className='dashboard-select' style={{ width: 'auto' }}>
                                                    <select
                                                        className="form-control"
                                                        onChange={handleMonthChange}
                                                        value={selectedMonth}
                                                        style={{
                                                            width: '150px', 
                                                            paddingRight: '1.5rem',
                                                        }}
                                                    >
                                                        <option value="January">January</option>
                                                        <option value="February">February</option>
                                                        <option value="March">March</option>
                                                        <option value="April">April</option>
                                                        <option value="May">May</option>
                                                        <option value="June">June</option>
                                                        <option value="July">July</option>
                                                        <option value="August">August</option>
                                                        <option value="September">September</option>
                                                        <option value="October">October</option>
                                                        <option value="November">November</option>
                                                        <option value="December">December</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="d-flex align-items-center dashboard-select">
                                                <label className="me-2 mb-0">Select Week</label> 
                                                <div style={{ width: 'auto' }}>
                                                    <select
                                                        className="form-control"
                                                        onChange={handleWeekChange}
                                                        value={selectedWeek}
                                                        style={{
                                                            width: '100px',
                                                            paddingRight: '1.5rem', 
                                                        }}
                                                    >
                                                        {weekOptions.map(week => (
                                                            <option key={week} value={week}>Week {week}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="table-responsive mt-3 due-row">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th className="index-column">#</th>
                                                        <th className="name-column-2">Officer Name</th>
                                                        {dates.map((date, index) => (
                                                            <th key={index}>{date}</th>
                                                        ))}
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentOfficers.map((officer, index) => (
                                                        <tr key={`${officer.userId}-${selectedMonth}-${selectedWeek}`}>
                                                            <td>{indexOfFirstOfficer + index + 1}</td>
                                                            <td>{officer.officerName || 'Name not available'}</td>
                                                            {officer.dues.map((due, dueIndex) => (
                                                                <td key={`${officer.userId}-${due.day}-${due.status}`}>
                                                                    <PaymentStatusTag
                                                                        initialStatus={due.status}
                                                                        onToggle={(newStatus) => {
                                                                            handleStatusToggle(officer.userId, due.day, due.status);
                                                                        }}
                                                                    />
                                                                </td>
                                                            ))}
                                                            <td className="text-center">
                                                                {userPermissions.duesPayment === 'edit' && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn pay-button"
                                                                        onClick={() => navigate(`/treasurer/manage-fee/amount/${officer.userId}`,
                                                                            {
                                                                                state: {
                                                                                    officerName: officer.officerName,
                                                                                    userId: officer.userId,
                                                                                    userType: officer.userType
                                                                                }
                                                                            }
                                                                        )}
                                                                    >
                                                                        <i className="fas fa-coins me-1"></i>
                                                                        Pay in Amount
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div>
                                                Showing {indexOfFirstOfficer + 1} to {Math.min(indexOfLastOfficer, officers.length)} of {officers.length} entries
                                            </div>
                                            <nav>
                                                <ul className="pagination mb-0">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Previous
                                                        </button>
                                                    </li>
                                                    {[...Array(totalPages)].map((_, index) => (
                                                        <li
                                                            key={index + 1}
                                                            className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                                                        >
                                                            <button
                                                                className="page-link"
                                                                onClick={() => setCurrentPage(index + 1)}
                                                            >
                                                                {index + 1}
                                                            </button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                                            disabled={currentPage === totalPages}
                                                        >
                                                            Next
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        </div>
                                    </React.Fragment>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreasurerDues;