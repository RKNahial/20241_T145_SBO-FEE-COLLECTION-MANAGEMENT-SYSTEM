import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar"; 
import AdminNavbar from "./AdminNavbar";

const AdminSchoolYear = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // State for school year data
    const [schoolYearData, setSchoolYearData] = useState({
        startYear: '',
        startMonth: '',
        endYear: '',
        endMonth: ''
    });

    // State for confirmation message
    const [confirmationMessage, setConfirmationMessage] = useState("");

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSchoolYearData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submission (add school year)
    const handleAddAcademicYear = (e) => {
        e.preventDefault();

        const { startYear, startMonth, endYear, endMonth } = schoolYearData;
        
        // Check if all fields are filled
        if (startYear && startMonth && endYear && endMonth) {
            // Show confirmation message
            setConfirmationMessage(`School Year ${startYear}-${endYear} (${startMonth} - ${endMonth}) has been successfully added!`);
            // Optionally clear the form after submission
            setSchoolYearData({
                startYear: '',
                startMonth: '',
                endYear: '',
                endMonth: ''
            });

            // Hide confirmation message after 3 seconds
            setTimeout(() => setConfirmationMessage(""), 3000); // Clear message after 3 seconds
        } else {
            setConfirmationMessage("Please fill out all fields.");
            setTimeout(() => setConfirmationMessage(""), 3000); // Clear message after 3 seconds
        }
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Students</title>
            </Helmet>
            {/* NAVBAR AND SIDEBAR */}
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
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
                <div className="container-fluid mb-5 form-top">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card mb-4">
                                <div className="card-header">
                                    <i className="fa-regular fa-calendar-days"></i> <span style={{ paddingLeft: '0.50rem', fontWeight: 'bold' }}>School Year</span>
                                </div>
                                <div className="card-body">
                                        {/* Confirmation Message */}
                                    {confirmationMessage && (
                                        <div className="alert alert-info" role="alert">
                                            {confirmationMessage}
                                        </div>
                                    )}
                                    {/* Add New School Year Form */}
                                    <form onSubmit={handleAddAcademicYear}>
                                        <div className="mb-3">
                                            <label>Start Year </label>
                                            <select 
                                                name="startYear"
                                                className="form-control"
                                                value={schoolYearData.startYear}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Start Year</option>
                                                {Array.from({ length: 6 }, (_, i) => {
                                                    const year = new Date().getFullYear() + i;
                                                    return <option key={year} value={year}>{year}</option>;
                                                })}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label>Select Start Month </label>
                                            <select 
                                                name="startMonth"
                                                className="form-control"
                                                value={schoolYearData.startMonth}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select Start Month</option>
                                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
                                                    <option key={index} value={index + 1}>{month}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label>End Year </label>
                                            <select 
                                                name="endYear"
                                                className="form-control"
                                                value={schoolYearData.endYear}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select End Year</option>
                                                {Array.from({ length: 6 }, (_, i) => {
                                                    const year = new Date().getFullYear() + i + 1;
                                                    return <option key={year} value={year}>{year}</option>;
                                                })}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label>End Month </label>
                                            <select 
                                                name="endMonth"
                                                className="form-control"
                                                value={schoolYearData.endMonth}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select End Month</option>
                                                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
                                                    <option key={index} value={index + 1}>{month}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mt-4 mb-0">
                                            <button type="submit" className="add-button btn btn-sm me-">
                                                <i className="fas fa-plus me-2"></i> Add School Year
                                            </button>
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

export default AdminSchoolYear;