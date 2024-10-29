// src/pages/treasurer/TreasurerFee.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TreasurerSidebar from "./TreasurerSidebar"; 
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerDues = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const sampleStud = [
        {
            id_no: '1901104188',
            name: 'Mary Joy Alonzo',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '2101102924',
            name: 'Jonathan Cruz',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '1901102046',
            name: 'Reena Dela Cruz',
            year_level: '3rd Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '2101101354',
            name: 'Peter John Garcia',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '1901103113',
            name: 'Jessa Mae Javier',
            year_level: '2nd Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '2101101979',
            name: 'Mark Anton Lim',
            year_level: '1st Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '2101103848',
            name: 'Anna Marie Mendoza',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },            
        {
            id_no: '1901104713',
            name: 'Liza Reyes',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },            
        {
            id_no: '1901104188',
            name: 'Samuel Santos',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '1901104235',
            name: 'Mary Joy Alonzo',
            year_level: '3rd Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '1901104188',
            name: 'I AM',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '2101102924',
            name: 'ONLY TESTING',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '1901102046',
            name: 'IF THE PAGINATION',
            year_level: '3rd Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '2101101354',
            name: 'IS WORKING',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '1901103113',
            name: 'BLAH BLAH BLAH',
            year_level: '2nd Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },
        {
            id_no: '2101101979',
            name: 'PROPER NAME',
            year_level: '1st Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '2101103848',
            name: 'PLACE NAME',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },            
        {
            id_no: '1901104713',
            name: 'BACKSTORY STUFF',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Not Paid'
        },            
        {
            id_no: '1901104188',
            name: 'Samuel Santos',
            year_level: '4th Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        },
        {
            id_no: '1901104235',
            name: 'Mary Joy Alonzo',
            year_level: '3rd Year',
            program: 'BSIT',
            paymentStatus: 'Paid'
        }
    ];

    // PAYMENT TAG
    const PaymentStatusTag = ({ status, onClick }) => {
        let className;

        switch (status) {
            case 'Paid':
                className = 'badge fully-paid';
                break;
            case 'Not Paid':
                className = 'badge not-paid';
                break;
            default:
                className = 'badge unknown';
        }

        return <span className={className} onClick={onClick} style={{ cursor: 'pointer' }}>{status}</span>;
    };

    // PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sampleStud.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sampleStud.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const showingStart = indexOfFirstItem + 1;
    const showingEnd = Math.min(indexOfLastItem, sampleStud.length);
    const totalEntries = sampleStud.length; 

    // SETTING UP DATES BASED ON INPUT
    const [selectedMonth, setSelectedMonth] = useState("October");
    const [selectedWeek, setSelectedWeek] = useState("1");
    const [dates, setDates] = useState([]);
    const navigate = useNavigate();

    const handleMonthChange = (event) => setSelectedMonth(event.target.value);
    const handleWeekChange = (event) => setSelectedWeek(event.target.value);

    const calculateDates = (month, week) => {
        const year = 2024; // Adjust to 2024
        const monthIndex = new Date(Date.parse(month + " 1, " + year)).getMonth();
        const firstOfMonth = new Date(year, monthIndex, 1);
        const firstDayOfWeek = firstOfMonth.getDate() + (week - 1) * 7 - firstOfMonth.getDay() + 1; // Start from Monday

        const datesArray = [
            new Date(year, monthIndex, firstDayOfWeek), // Monday
            new Date(year, monthIndex, firstDayOfWeek + 1), // Tuesday
            new Date(year, monthIndex, firstDayOfWeek + 3), // Thursday
            new Date(year, monthIndex, firstDayOfWeek + 4)  // Friday
        ].map(date => date.getDate()).filter(date => date > 0); // Filter out invalid dates

        setDates(datesArray);
    };

    useEffect(() => {
        calculateDates(selectedMonth, selectedWeek);
    }, [selectedMonth, selectedWeek]);

    useEffect(() => {
        // Set default values based on the current date
        const today = new Date();
        const currentMonth = today.toLocaleString('default', { month: 'long' });
        const currentWeek = Math.ceil((today.getDate() - 1) / 7) + 1; // Calculate the current week
        setSelectedMonth(currentMonth);
        setSelectedWeek(currentWeek.toString());
        calculateDates(currentMonth, currentWeek);
    }, []);

    return (
        <div className="sb-nav-fixed">
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{ marginLeft: isCollapsed ? '5rem' : '15.625rem', transition: 'margin-left 0.3s', flexGrow: 1, marginTop: '3.5rem' }}>
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="card mb-4">
                            <div className="card-header">
                                <strong><i className="fas fa-coins me-2"></i>Daily Dues</strong>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-start mb-3">
                                    <div className="d-flex align-items-center me-3"> 
                                        <label className="me-2 mb-0">Select Month</label>
                                            <div style={{ width: 'auto' }}>
                                                <select className="form-control" onChange={handleMonthChange} value={selectedMonth}>
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
                                    <div className="d-flex align-items-center"> 
                                        <label className="me-2 mb-0">Select Week</label>
                                        <div style={{ width: 'auto' }}>
                                            <select className="form-control" onChange={handleWeekChange} value={selectedWeek}>
                                                <option value="1">Week 1</option>
                                                <option value="2">Week 2</option>
                                                <option value="3">Week 3</option>
                                                <option value="4">Week 4</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <table className="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Officer Name</th>
                                            {dates.map((date, index) => (
                                                <th key={index}>{date}</th>
                                            ))}
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((student, index) => (
                                            <tr key={student.id_no}>
                                                <td>{index + indexOfFirstItem + 1}</td>
                                                <td>{student.name}</td>
                                                <td><PaymentStatusTag status={student.paymentStatus} /></td>
                                                <td><PaymentStatusTag status={student.paymentStatus} /></td>
                                                <td><PaymentStatusTag status={student.paymentStatus} /></td>
                                                <td><PaymentStatusTag status={student.paymentStatus} /></td>
                                                <td className="text-center">
                                                    <button 
                                                        type="button" 
                                                        className="btn pay-button" 
                                                        onClick={() => navigate(`/treasurer/manage-fee/amount/${student.id_no}`, { state: { studentName: student.name } })}
                                                    >
                                                        <i className="fas fa-coins me-1"></i>
                                                        Pay in Amount
                                                    </button>
                                                </td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="d-flex justify-content-between align-items-center mb-2" style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                    <div>Showing {showingStart} to {showingEnd} of {sampleStud.length} entries</div>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                                            </li>
                                            {Array.from({ length: totalPages }, (_, index) => (
                                                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
                                                </li>
                                            ))}
                                            <li className="page-item">
                                                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreasurerDues;