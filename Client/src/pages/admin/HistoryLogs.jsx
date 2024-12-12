import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Form, Table, Badge, Spinner } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import axios from 'axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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

            // Check if response.data exists and is an array
            if (Array.isArray(response.data)) {
                setLogs(response.data);
            } else {
                setError('Invalid data format received');
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to fetch history logs');
            }
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

    // Add this function to handle searching
    const filteredLogs = logs
        .filter(log => {
            const searchString = searchTerm.toLowerCase();
            return (
                log.userName?.toLowerCase().includes(searchString) ||
                log.userEmail?.toLowerCase().includes(searchString) ||
                log.userPosition?.toLowerCase().includes(searchString) ||
                log.action?.toLowerCase().includes(searchString) ||
                log.details?.toLowerCase().includes(searchString) ||
                new Date(log.timestamp).toLocaleString().toLowerCase().includes(searchString)
            );
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by timestamp descending

    // Update these calculations to use filteredLogs
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Add this to reset pagination when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="sb-nav-fixed">
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
                <div className="content-wrapper" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    transition: 'margin-left 0.3s ease',
                    width: `calc(100% - ${isCollapsed ? '5rem' : '15.625rem'})`,
                    padding: '20px'
                }}>
                    <h2 className="page-title">History Logs</h2>

                    <Card className="filter-card mb-4">
                        <Card.Body>
                            <Row>
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
                                                    color: '#6c757d'
                                                }}
                                            ></i>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
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
                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className="logs-table-card">
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

                                            <Table responsive hover className="logs-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Timestamp</th>
                                                        <th>User Name</th>
                                                        <th>Email</th>
                                                        <th>Position</th>
                                                        <th>Action</th>
                                                        <th style={{ minWidth: '300px' }}>Details</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentLogs.map((log, index) => (
                                                        <tr key={log._id}>
                                                            <td>{indexOfFirstItem + index + 1}</td>
                                                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                            <td>{log.userName}</td>
                                                            <td>{log.userEmail}</td>
                                                            <td>{log.userPosition}</td>
                                                            <td>{log.action}</td>
                                                            <td style={{
                                                                whiteSpace: 'normal',
                                                                wordBreak: 'break-word',
                                                                minWidth: '300px'
                                                            }}>
                                                                {log.details}
                                                            </td>
                                                            <td>
                                                                <Badge bg={log.status === 'completed' ? 'success' : 'warning'}>
                                                                    {log.status}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>

                                            {/* Pagination section */}
                                            <div className="d-flex justify-content-between align-items-center mt-3"
                                                style={{ color: '#6C757D', fontSize: '0.875rem' }}>
                                                <div>
                                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} entries
                                                    {searchTerm && ` (filtered from ${logs.length} total entries)`}
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
                                                            <li key={index + 1}
                                                                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>

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
    );
};

export default HistoryLogs;