import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Form, Table, Badge, Spinner } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Helmet } from 'react-helmet';

const HistoryLogs = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:8000/api/history-logs';

            // Add query parameters if filters are set
            const params = new URLSearchParams();
            if (filterStartDate) params.append('startDate', filterStartDate);
            if (filterEndDate) params.append('endDate', filterEndDate);
            if (filterAction) params.append('action', filterAction);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Check if response has the expected format
            if (response.data && response.data.success && Array.isArray(response.data.logs)) {
                setLogs(response.data.logs);
                setError(null);
            } else {
                setError('Invalid data format received');
                setLogs([]);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to fetch history logs');
            }
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filterStartDate, filterEndDate, filterAction]);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // Filter logs based on search term
    const filteredLogs = logs.filter(log => {
        const searchString = searchTerm.toLowerCase();
        const timestamp = new Date(log.timestamp);
        const formattedDate = timestamp.toLocaleDateString('en-PH');
        const formattedTime = timestamp.toLocaleTimeString('en-PH', { 
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Manila'
        });
        
        const userInfo = `${log.userName} (${log.userPosition})`;
        
        return (
            userInfo.toLowerCase().includes(searchString) ||
            log.userEmail?.toLowerCase().includes(searchString) ||
            log.action?.toLowerCase().includes(searchString) ||
            log.details?.toLowerCase().includes(searchString) ||
            formattedDate.toLowerCase().includes(searchString) ||
            formattedTime.toLowerCase().includes(searchString)
        );
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Reset pagination when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="sb-nav-fixed" style={{ height: '100vh', overflowy: 'hidden' }}>
            <Helmet>
                <title>Admin | History Logs</title>
            </Helmet>
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    transition: 'margin-left 0.3s',
                    flexGrow: 1,
                    marginTop: '3.5rem',
                    overflowY: 'hidden'
                }}>
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="row">
                                    <div className="col col-md-6">
                                        <i className="fas fa-history me-2"></i>
                                        <strong>History Logs</strong>
                                    </div>
                                </div>
                            </div>
            
                            <Card className="filter-card" style={{ border: 'none' }}>
                                <Card.Body>
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group>
                                                <div style={{ width: '100%', maxWidth: '400px', margin: '0 0' }}>
                                                    <Form.Label style={{ marginBottom: '8px' }}>
                                                        Filter by Date Range
                                                    </Form.Label>
                                                    <div className="d-flex gap-2 align-items-center">
                                                        <div className="position-relative" style={{ flex: 1 }}>
                                                            <DatePicker
                                                                selected={filterStartDate ? new Date(filterStartDate) : null}
                                                                onChange={(date) => setFilterStartDate(date ? date.toISOString().split('T')[0] : '')}
                                                                dateFormat="yyyy-MM-dd"
                                                                className="form-control"
                                                                placeholderText="Start date"
                                                                isClearable
                                                            />
                                                        </div>
                                                        <span>to</span>
                                                        <div className="position-relative" style={{ flex: 1 }}>
                                                            <DatePicker
                                                                selected={filterEndDate ? new Date(filterEndDate) : null}
                                                                onChange={(date) => setFilterEndDate(date ? date.toISOString().split('T')[0] : '')}
                                                                dateFormat="yyyy-MM-dd"
                                                                className="form-control"
                                                                placeholderText="End date"
                                                                isClearable
                                                                minDate={filterStartDate ? new Date(filterStartDate) : null}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Filter by Action</Form.Label>
                                                <Form.Select
                                                    value={filterAction}
                                                    onChange={(e) => setFilterAction(e.target.value)}
                                                >
                                                    <option value="">All Actions</option>
                                                    <option value="ADD_STUDENT">Add Student</option>
                                                    <option value="ADD_PAYMENT_CATEGORY">Add Payment Category</option>
                                                    <option value="UPDATE_STUDENT">Update Student</option>
                                                    <option value="UPDATE_PAYMENT_CATEGORY">Update Payment Category</option>
                                                    <option value="ARCHIVE_STUDENT">Archive Student</option>
                                                    <option value="UNARCHIVE_STUDENT">Unarchive Student</option>
                                                    <option value="TOGGLE_DUES_PAYMENT">Toggle Dues Payment</option>
                                                    <option value="DUES_PAYMENT">Dues Payment</option>
                                                    <option value="PAYMENT_UPDATE">Payment Update</option>
                                                    <option value="ARCHIVE_CATEGORY">Archive Category</option>
                                                    <option value="UNARCHIVE_CATEGORY">Unarchive Category</option>
                                                    <option value="EMAIL_SENT">Email Sent</option>
                                                    <option value="LOGIN">Login</option>
                                                    <option value="LOGOUT">Logout</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label>Search</Form.Label>
                                                <div className="position-relative">
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Search History logs..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="pe-4"
                                                    />
                                                    <i className="fas fa-search position-absolute"
                                                        style={{
                                                            top: '50%',
                                                            right: '10px',
                                                            transform: 'translateY(-50%)',
                                                            color: '#FF8C00'
                                                        }}
                                                    ></i>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            <Card className="logs-table-card" style={{ border: 'none' }}>
                                <Card.Body>
                                    {loading ? (
                                        <LoadingSpinner
                                            text="Loading History Logs"
                                            icon="history"
                                            subtext="Fetching system activity logs..."
                                        />
                                    ) : error ? (
                                        <div className="alert alert-danger">
                                            <i className="fas fa-exclamation-circle me-2"></i>
                                            {error}
                                        </div>
                                    ) : (
                                        <>
                                            {filteredLogs.length === 0 ? (
                                                <div className="text-center text-muted my-4">
                                                    <i className="fas fa-search me-2"></i>
                                                    No matching logs found
                                                </div>
                                            ) : (
                                                <>
                                                <div className='table-shadow'>
                                                    <Table responsive hover className="logs-table">
                                                        <thead>
                                                            <tr>
                                                                <th style={{ width: '5%' }}>#</th>
                                                                <th style={{ width: '10%' }}>Date</th>
                                                                <th style={{ width: '10%' }}>Time</th>
                                                                <th style={{ width: '15%' }}>User</th>
                                                                <th style={{ width: '12%' }}>Position</th>
                                                                <th style={{ width: '15%' }}>Action</th>
                                                                <th style={{ width: '35%' }}>Details</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentLogs.map((log, index) => {
                                                                const timestamp = new Date(log.timestamp);
                                                                return (
                                                                    <tr key={log._id}>
                                                                        <td>{indexOfFirstItem + index + 1}</td>
                                                                        <td>{timestamp.toLocaleDateString('en-PH')}</td>
                                                                        <td>
                                                                            {timestamp.toLocaleTimeString('en-PH', { 
                                                                                hour: 'numeric',
                                                                                minute: '2-digit',
                                                                                hour12: true,
                                                                                timeZone: 'Asia/Manila'
                                                                            })}
                                                                        </td>
                                                                        <td>{log.userName}</td>
                                                                        <td>{log.userPosition}</td>
                                                                        <td>{log.action}</td>
                                                                        <td style={{
                                                                            whiteSpace: 'normal',
                                                                            wordBreak: 'break-word',
                                                                            minWidth: '300px'
                                                                        }}>
                                                                            {log.details}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </Table>
                                                </div>

                                                   {/* Pagination section */}
                                                    <div className="d-flex justify-content-between align-items-center mt-3"
                                                        style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                                        <div>
                                                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} entries
                                                            {searchTerm && ` (filtered from ${logs.length} total entries)`}
                                                        </div>
                                                        <nav>
                                                            <ul className="pagination mb-0">
                                                                {/* Previous button */}
                                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() => paginate(currentPage - 1)}
                                                                        disabled={currentPage === 1}
                                                                    >
                                                                        Previous
                                                                    </button>
                                                                </li>

                                                                {/* First page */}
                                                                <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                                                                    <button 
                                                                        className="page-link" 
                                                                        onClick={() => paginate(1)}
                                                                        style={currentPage === 1 ? 
                                                                            { backgroundColor: '#FF8C00', borderColor: '#FF8C00', color: 'white' } 
                                                                            : {}}
                                                                    >
                                                                        1
                                                                    </button>
                                                                </li>

                                                                {/* Ellipsis after first page */}
                                                                {currentPage > 3 && (
                                                                    <li className="page-item disabled">
                                                                        <span className="page-link">...</span>
                                                                    </li>
                                                                )}

                                                                {/* Pages around current page */}
                                                                {Array.from({ length: 3 }, (_, idx) => {
                                                                    const pageNumber = currentPage + idx - 1;
                                                                    if (pageNumber > 1 && pageNumber < totalPages) {
                                                                        return (
                                                                            <li key={pageNumber} 
                                                                                className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                                                                <button 
                                                                                    className="page-link"
                                                                                    onClick={() => paginate(pageNumber)}
                                                                                    style={currentPage === pageNumber ? 
                                                                                        { backgroundColor: '#FF8C00', borderColor: '#FF8C00', color: 'white' } 
                                                                                        : {}}
                                                                                >
                                                                                    {pageNumber}
                                                                                </button>
                                                                            </li>
                                                                        );
                                                                    }
                                                                    return null;
                                                                }).filter(Boolean)}

                                                                {/* Ellipsis before last page */}
                                                                {currentPage < totalPages - 2 && (
                                                                    <li className="page-item disabled">
                                                                        <span className="page-link">...</span>
                                                                    </li>
                                                                )}

                                                                {/* Last page */}
                                                                {totalPages > 1 && (
                                                                    <li className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                                                                        <button 
                                                                            className="page-link"
                                                                            onClick={() => paginate(totalPages)}
                                                                            style={currentPage === totalPages ? 
                                                                                { backgroundColor: '#FF8C00', borderColor: '#FF8C00', color: 'white' } 
                                                                                : {}}
                                                                        >
                                                                            {totalPages}
                                                                        </button>
                                                                    </li>
                                                                )}

                                                                {/* Next button */}
                                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() => paginate(currentPage + 1)}
                                                                        disabled={currentPage === totalPages}
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </nav>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryLogs;