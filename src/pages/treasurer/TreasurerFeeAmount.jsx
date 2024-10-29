// src/pages/treasurer/TreasurerFeeDetail.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import TreasurerSidebar from "./TreasurerSidebar"; 
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerFeeAmount = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);

    // PAYMENT
    const location = useLocation();
    const navigate = useNavigate();
    const officerName = location.state?.studentName || '';

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const handleSave = (event) => {
        event.preventDefault();
        const confirmed = window.confirm("Are you sure you want to proceed with the payment?");
        
        if (confirmed) {
            // Logic for saving the data goes here
            // For example, you could make an API call to save the amount
    
            // You can show a success message or redirect if needed
            alert("Payment successful!");
            // Optionally navigate back or clear fields if needed
        } else {
            // If the user cancels, do nothing
        }
    };

    const handleCancel = () => {
        navigate("/treasurer/daily-dues"); 
    };
    // CALCULATE DAYS COVERED
    const [amount, setAmount] = useState(0);
    const [daysCovered, setDaysCovered] = useState(0);

    const handleAmountChange = (event) => {
        const inputAmount = Number(event.target.value);
        setAmount(inputAmount);
        
        // Calculate days covered
        const calculatedDays = Math.floor(inputAmount / 5);
        setDaysCovered(calculatedDays);
    };

    return (
        <div className="sb-nav-fixed">
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
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="fas fa-coins me-2"></i> <strong>Pay in Amount</strong>
                                    </div>
                                    <div className="card-body">
                                    <form onSubmit={handleSave}>
                                            <div className="mb-3">
                                                <label className="mb-1">Officer Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control system"
                                                    value={officerName} 
                                                    readOnly 
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Amount</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Enter amount"
                                                    value={amount > 0 ? amount : ''} // Ensure it's editable
                                                    onChange={handleAmountChange} 
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Days Covered</label>
                                                <input
                                                    type="text"
                                                    className="form-control system"
                                                    value={daysCovered} 
                                                    readOnly 
                                                />
                                            </div>
                                            <div className="d-flex justify-content-end">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-success me-2 system-button"
                                                >
                                                    Save
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={handleCancel} 
                                                    className="btn btn-danger"
                                                >
                                                    Cancel
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

export default TreasurerFeeAmount;