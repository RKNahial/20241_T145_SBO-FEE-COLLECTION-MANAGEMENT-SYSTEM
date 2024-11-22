import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Form, Table, Badge, Spinner } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import axios from 'axios';

const HistoryLogs = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterDate, setFilterDate] = useState('');
    const [filterAction, setFilterAction] = useState('');

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            let url = 'http://localhost:8000/api/history-logs';

            // Add query parameters if filters are set
            const params = new URLSearchParams();
            if (filterDate) params.append('startDate', filterDate);
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
    }, [filterDate, filterAction]);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

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
                                        <Form.Label>Filter by Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={filterDate}
                                            onChange={(e) => setFilterDate(e.target.value)}
                                        />
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
                                <div className="text-center">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : error ? (
                                <div className="alert alert-danger">{error}</div>
                            ) : (
                                <Table responsive hover className="logs-table">
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>User Name</th>
                                            <th>Email</th>
                                            <th>Position</th>
                                            <th>Action</th>
                                            <th>Details</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map(log => (
                                            <tr key={log._id}>
                                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                                <td>{log.userName}</td>
                                                <td>{log.userEmail}</td>
                                                <td>{log.userPosition}</td>
                                                <td>{log.action}</td>
                                                <td>{log.details}</td>
                                                <td>
                                                    <Badge bg={log.status === 'completed' ? 'success' : 'warning'}>
                                                        {log.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default HistoryLogs; 