// src/pages/treasurer/TreasurerFeeAmount.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";

const TreasurerFeeAmount = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [amount, setAmount] = useState(0);
    const [daysCovered, setDaysCovered] = useState(0);
    const [loading, setLoading] = useState(false);
    const [weeksAndMonthsCovered, setWeeksAndMonthsCovered] = useState([]);

    const location = useLocation();
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const officerName = location.state?.officerName || 'Unknown';
    const userId = location.state?.userId;
    const userType = location.state?.userType;

    const calculateCoverage = (inputAmount) => {
        const daysPerWeek = 4; // Monday, Tuesday, Thursday, Friday
        const amountPerDay = 5;
        const totalDays = Math.floor(inputAmount / amountPerDay);

        let remainingDays = totalDays;
        const coverage = [];
        const currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentWeek = Math.ceil(currentDate.getDate() / 7);

        while (remainingDays > 0) {
            const daysInThisWeek = Math.min(remainingDays, daysPerWeek);
            coverage.push({
                month: new Date(currentDate.getFullYear(), currentMonth).toLocaleString('default', { month: 'long' }),
                week: currentWeek,
                days: daysInThisWeek
            });

            remainingDays -= daysInThisWeek;
            currentWeek++;

            if (currentWeek > 4) {
                currentWeek = 1;
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                }
            }
        }

        return coverage;
    };

    const handleAmountChange = (event) => {
        const inputAmount = Math.max(0, Number(event.target.value));
        setAmount(inputAmount);
        const totalDays = Math.floor(inputAmount / 5);
        setDaysCovered(totalDays);
        setWeeksAndMonthsCovered(calculateCoverage(inputAmount));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const confirmed = window.confirm("Are you sure you want to proceed with the payment?");
        if (!confirmed) return;

        setLoading(true);
        let successCount = 0;
        let errorMessages = [];

        try {
            for (const coverage of weeksAndMonthsCovered) {
                try {
                    const response = await fetch(`http://localhost:8000/api/daily-dues/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: coverage.days * 5,
                            userType,
                            month: coverage.month,
                            week: coverage.week.toString(),
                            daysCount: coverage.days
                        }),
                    });

                    const data = await response.json();

                    if (data.success) {
                        successCount++;
                    } else {
                        errorMessages.push(`${coverage.month} Week ${coverage.week}: ${data.message}`);
                    }
                } catch (err) {
                    console.error('Payment error:', err);
                    errorMessages.push(`${coverage.month} Week ${coverage.week}: Failed to process`);
                }
            }

            if (successCount > 0) {
                alert(`Successfully processed payments for ${successCount} periods.`);

                // Force refresh before navigation
                await fetch(`http://localhost:8000/api/daily-dues?month=${weeksAndMonthsCovered[0].month}&week=${weeksAndMonthsCovered[0].week}`, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });

                navigate("/treasurer/daily-dues", {
                    state: {
                        timestamp: Date.now(),
                        month: weeksAndMonthsCovered[0].month,
                        week: weeksAndMonthsCovered[0].week.toString(),
                        refresh: true
                    },
                    replace: true
                });
            } else {
                alert(`Failed to process payments:\n${errorMessages.join('\n')}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Failed to process payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/treasurer/daily-dues");
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Pay in Amount</title>
            </Helmet>
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content"
                    style={{
                        marginLeft: isCollapsed ? '5rem' : '15.625rem',
                        transition: 'margin-left 0.3s',
                        flexGrow: 1,
                        marginTop: '3.5rem'
                    }}>
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="fas fa-coins me-2"></i>
                                        <strong>Pay in Amount</strong>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={handleSave}>
                                            <div className="mb-3">
                                                <label className="mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control system"
                                                    value={officerName}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="mb-1">Amount (₱)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Enter amount"
                                                    value={amount || ''}
                                                    onChange={handleAmountChange}
                                                    min="0"
                                                    step="5"
                                                    required
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
                                            <div className="mb-3">
                                                <label className="mb-1">Coverage Details</label>
                                                <div className="coverage-details">
                                                    {weeksAndMonthsCovered.map((coverage, index) => (
                                                        <div key={index} className="coverage-item">
                                                            {coverage.month} - Week {coverage.week}: {coverage.days} days
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-end">
                                                <button
                                                    type="submit"
                                                    className="btn btn-success me-2 system-button"
                                                    disabled={loading || amount <= 0}
                                                >
                                                    {loading ? 'Processing...' : 'Save'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    className="btn btn-danger"
                                                    disabled={loading}
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