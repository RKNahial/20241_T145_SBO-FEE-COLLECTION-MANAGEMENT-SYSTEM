// src/pages/officer/OfficerStudents.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useRef } from "react";
import { Link } from 'react-router-dom';
import OfficerSidebar from "./OfficerSidebar"; 
import OfficerNavbar from "./OfficerNavbar";

const OfficerEvents = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Sample data for demonstration only
    const sampleEvents = [
        {
            id: 1,
            eventName: 'College Week',
            startDate: '2024-02-15',
            endDate: '2024-02-20',
            status: 'Upcoming'
        },
        {
            id: 2,
            eventName: 'Foundation Day',
            startDate: '2024-03-01',
            endDate: '2024-03-02',
            status: 'Upcoming'
        },
        {
            id: 3,
            eventName: 'Sports Fest',
            startDate: '2024-01-10',
            endDate: '2024-01-15',
            status: 'Completed'
        },
        {
            id: 4,
            eventName: 'Cultural Night',
            startDate: '2024-04-05',
            endDate: '2024-04-05',
            status: 'Upcoming'
        },
        {
            id: 5,
            eventName: 'Academic Week',
            startDate: '2023-12-01',
            endDate: '2023-12-05',
            status: 'Completed'
        }
    ];

    // EVENT TAG
    const EventStatusTag = ({ status, onClick }) => {
        let className;

        switch (status) {
            case 'Upcoming':
                className = 'badge upcoming';
                break;
            case 'Completed':
                className = 'badge completed';
                break;
            default:
                className = 'badge unknown';
        }

        return <span className={className} onClick={onClick} style={{ cursor: 'pointer' }}>{status}</span>;
    };

    // HANDLE ARCHIVE
    const [successMessage, setSuccessMessage] = useState("");
    const handleArchive = (studentName) => {
        const confirmArchive = window.confirm(`Are you sure you want to archive ${studentName}?`);
        if (confirmArchive) {
            // Perform the archive action, e.g., make an API call
            console.log(`${studentName} has been archived.`);
            setSuccessMessage(`${studentName} has been successfully archived!`);
            
            setTimeout(() => {
                setSuccessMessage("");
            }, 2500);
        }
    };

    // HANDLE UNARCHIVE
    const handleUnarchive = (studentName) => {
        const confirmUnarchive = window.confirm(`Are you sure you want to unarchive ${studentName}?`);
        if (confirmUnarchive) {
            // Perform the unarchive action, e.g., make an API call
            console.log(`${studentName} has been unarchived.`);
            setSuccessMessage(`${studentName} has been successfully unarchived!`);
            
            setTimeout(() => {
                setSuccessMessage("");
            }, 2500);
        }
    };

    // IMPORT EXCEL
    const fileInputRef = useRef(null);
    const handleImportClick = () => {
        fileInputRef.current.click();
    };
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        // Handle the file upload logic here
        console.log(file);
    };

    // HANDLE GOOGLE NOTES
    const handleOpenGoogleNotes = (studentId) => {
        const noteTitle = `Notes for ${studentId}`;
        const noteContent = `Add your notes for student ${studentId} here.`;
        
        // Construct the Google Keep URL
        const googleKeepUrl = `https://keep.google.com/#NOTE&title=${encodeURIComponent(noteTitle)}&text=${encodeURIComponent(noteContent)}`;
    
        // Open in a new tab
        window.open(googleKeepUrl, '_blank');
    };

    // PAGINATION - Fixed to use sampleEvents instead of sampleStud
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sampleEvents.slice(indexOfFirstItem, indexOfLastItem);  // Changed here
    const totalPages = Math.ceil(sampleEvents.length / itemsPerPage);  // Changed here
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const showingStart = indexOfFirstItem + 1;
    const showingEnd = Math.min(indexOfLastItem, sampleEvents.length);  // Changed here
    const totalEntries = sampleEvents.length;  // Changed here


    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Officer | Events</title>
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
                                        <i className="fa fa-calendar me-2"></i> <strong>Events</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body">
                                {successMessage && (  
                                        <div className="alert alert-success" role="alert">
                                            {successMessage}
                                        </div>
                                    )}
                                {/* ADD NEW STUDENT AND IMPORT EXCEL BUTTON */}
                                <div className="d-flex justify-content-between mb-3 align-items-center">
                                    <div className="d-flex me-auto"> 
                                        <Link to="/officer/events/add-new" className="add-button btn btn-sm me-2">
                                            <i className="fas fa-plus me-2"></i>
                                            Add New Event
                                        </Link>
                                    </div>
                                    <div className="d-flex align-items-center me-3"> 
                                        <label className="me-2 mb-0">Event Status</label>
                                        <div className="dashboard-select" style={{ width: 'auto' }}>
                                            <select className="form-control" defaultValue="">
                                                <option value="All">All</option>
                                                <option value="Upcoming">Upcoming</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <form method="get" className="d-flex search-bar">
                                        <input type="text" placeholder="Search events" className="search-input me-2" />
                                        <button type="submit" className="search btn btn-sm">
                                            <i className="fas fa-search"></i>
                                        </button>
                                    </form>
                                </div>

                                {/* TABLE EVENTS */}
                                <table className="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Event</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((event, index) => (
                                            <tr key={event.id}>
                                                <td>{index + indexOfFirstItem + 1}</td> 
                                                <td>{event.eventName}</td>
                                                <td>{new Date(event.startDate).toLocaleDateString()}</td>
                                                <td>{new Date(event.endDate).toLocaleDateString()}</td>
                                                <td>
                                                    <EventStatusTag 
                                                        status={event.status} 
                                                        onClick={() => {}} 
                                                    />
                                                </td>
                                                <td>
                                                    <Link 
                                                        to={`/officer/events/edit/${event.id}`} 
                                                        className="btn btn-edit btn-sm"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* SHOWING OF ENTRIES AND PAGINATION */}
                                <div className="d-flex justify-content-between align-items-center mb-2" style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                    <div>
                                        Showing {showingStart} to {showingEnd} of {totalEntries} entries
                                    </div>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li className="page-item">
                                                <button 
                                                    className="page-link" 
                                                    onClick={() => paginate(currentPage - 1)} 
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </button>
                                            </li>
                                            {Array.from({ length: totalPages }, (_, index) => (
                                                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                    <button 
                                                        className="page-link" 
                                                        onClick={() => paginate(index + 1)}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                </li>
                                            ))}
                                            <li className="page-item">
                                                <button 
                                                    className="page-link page-label" 
                                                    onClick={() => paginate(currentPage + 1)} 
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </button>
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

export default OfficerEvents;