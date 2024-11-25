// src/pages/admin/AdminDashboard.jsx
import { Helmet } from 'react-helmet';
import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import axios from 'axios';
import { getAnalytics, logEvent } from "firebase/analytics";
import { app } from '../firebase/firebaseConfig';
import '../../assets/css/calendar.css';

const CALENDAR_ID = 'c_24e4973e704b983a944d5bc4cd1a7e0437d3eb519a1935d01706fb81909b68d3@group.calendar.google.com';
const CALENDAR_URL = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(CALENDAR_ID)}&ctz=UTC`;

const AdminDashboard = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [stats, setStats] = useState({
        totalActiveStudents: 0,
        totalActiveOfficers: 0,
        totalAdmins: 0,
        pageViews: 0
    });
    const analytics = getAnalytics(app);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const toggleSidebar = useCallback(() => {
        setIsCollapsed(prev => !prev);
    }, []);

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');

            // Fetch all stats in parallel
            const [studentsRes, officersRes, adminsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/active-students-count', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:8000/api/admin/active-officers-count', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:8000/api/admin/active-admins-count', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats({
                totalActiveStudents: studentsRes.data.count,
                totalActiveOfficers: officersRes.data.count,
                totalAdmins: adminsRes.data.count,
                pageViews: 0 // This can be implemented later if needed
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Fetch files from Google Drive
    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/drive/files', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(response.data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    // Function to trigger file input click
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Separate function to handle file selection
    const handleFileSelect = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedFile(file);
            handleFileUpload(file); // Automatically upload when file is selected
        }
    };

    // Handle file upload
    const handleFileUpload = async (file) => {
        if (!file) {
            console.error('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/drive/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });
            fetchFiles();
            setUploadProgress(0);
        } catch (error) {
            console.error('Error uploading file:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle file deletion
    const handleDeleteFile = async (fileId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/drive/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFiles(); // Refresh file list
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchFiles();
    }, []);

    // Filter files based on search
    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const indexOfLastFile = currentPage * itemsPerPage;
    const indexOfFirstFile = indexOfLastFile - itemsPerPage;
    const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

    // Add this function for calendar
    const handleAddToCalendar = () => {
        const addEventUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?cid=${encodeURIComponent(CALENDAR_ID)}`;
        window.open(addEventUrl, '_blank');
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Admin | Dashboard</title>
            </Helmet>
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <AdminSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    marginRight: '0rem',
                    transition: 'margin-left 0.3s',
                    flexGrow: 1,
                    marginTop: '3.5rem'
                }}>
                    <div className="container-fluid px-4">
                        {/* Welcome Message */}
                        <h4 className="mt-4 mb-4">Welcome back, Admin!</h4>

                        {/* Statistics Cards Row */}
                        <div className="row justify-content-center mb-4">
                            <div className="col-xl-3 col-md-6 mb-3">
                                <div className="card border-0" style={{
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div className="card-body d-flex align-items-center justify-content-center py-3"
                                        style={{
                                            backgroundColor: '#FF8C00',
                                            borderRadius: '15px'
                                        }}>
                                        <div className="text-center">
                                            <div className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                <i className="fas fa-user-graduate fa-lg text-white"></i>
                                            </div>
                                            <h5 className="mb-1 fw-bold text-white">{stats.totalActiveStudents}</h5>
                                            <p className="mb-0 text-white">Active Students</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6 mb-3">
                                <div className="card border-0" style={{
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div className="card-body d-flex align-items-center justify-content-center py-3"
                                        style={{
                                            backgroundColor: '#FF8C00',
                                            borderRadius: '15px'
                                        }}>
                                        <div className="text-center">
                                            <div className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                <i className="fas fa-user-tie fa-lg text-white"></i>
                                            </div>
                                            <h5 className="mb-1 fw-bold text-white">{stats.totalActiveOfficers}</h5>
                                            <p className="mb-0 text-white">Active Officers</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6 mb-3">
                                <div className="card border-0" style={{
                                    borderRadius: '15px',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <div className="card-body d-flex align-items-center justify-content-center py-3"
                                        style={{
                                            backgroundColor: '#FF8C00',
                                            borderRadius: '15px'
                                        }}>
                                        <div className="text-center">
                                            <div className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                                }}>
                                                <i className="fas fa-user-shield fa-lg text-white"></i>
                                            </div>
                                            <h5 className="mb-1 fw-bold text-white">{stats.totalAdmins}</h5>
                                            <p className="mb-0 text-white">Total Admins</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="row">
                            {/* Left Column - Calendar */}
                            <div className="col-xl-8 mb-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white border-0 py-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0 fw-semibold text-primary">
                                                <i className="far fa-calendar-alt me-2"></i>
                                                Calendar
                                            </h6>
                                            <button
                                                className="btn btn-outline-primary btn-sm px-3 py-1"
                                                onClick={handleAddToCalendar}
                                                style={{ fontSize: '0.8rem' }}
                                            >
                                                <i className="fas fa-plus me-1"></i>
                                                Add Event
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="calendar-wrapper" style={{ height: '500px' }}>
                                            <iframe
                                                src={CALENDAR_URL}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 'none'
                                                }}
                                                frameBorder="0"
                                                scrolling="no"
                                                title="Admin Calendar"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - File Upload */}
                            <div className="col-xl-4 mb-4">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-header bg-white border-0 py-3">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0">
                                                <i className="fas fa-upload me-2 text-primary"></i>
                                                Upload Files
                                            </h5>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={handleUploadClick}
                                                disabled={loading}
                                            >
                                                <i className="fas fa-upload me-2"></i>
                                                Upload File
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-body p-0">
                                        <div className="mb-3">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                style={{ display: 'none' }}
                                                onChange={handleFileSelect}
                                                disabled={loading}
                                            />
                                        </div>
                                        {uploadProgress > 0 && (
                                            <div className="progress mb-3">
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{ width: `${uploadProgress}%` }}
                                                    aria-valuenow={uploadProgress}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                >
                                                    {uploadProgress}%
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* File List Section - Full Width */}
                        <div className="row">
                            <div className="col-12">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="fas fa-file me-1"></i>
                                        Files
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <input
                                                    type="text"
                                                    className="form-control form-control-sm me-2"
                                                    placeholder="Search files..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Type</th>
                                                        <th>Size</th>
                                                        <th>Last Modified</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentFiles.map((file) => (
                                                        <tr key={file.id}>
                                                            <td>{file.name}</td>
                                                            <td>{file.mimeType}</td>
                                                            <td>{formatFileSize(file.size)}</td>
                                                            <td>{new Date(file.modifiedTime).toLocaleString()}</td>
                                                            <td className="align-middle">
                                                                <div className="d-flex align-items-center justify-content-center" style={{ gap: '8px' }}>
                                                                    <a
                                                                        href={file.webViewLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-primary"
                                                                        style={{
                                                                            width: '36px',
                                                                            height: '36px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            padding: 0,
                                                                            lineHeight: '1',
                                                                            marginBottom: '14px',
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-eye" style={{ fontSize: '16px' }}></i>
                                                                    </a>
                                                                    <a
                                                                        href={file.webContentLink}
                                                                        download
                                                                        className="btn btn-success"
                                                                        style={{
                                                                            width: '36px',
                                                                            height: '36px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            padding: 0,
                                                                            lineHeight: '1'


                                                                        }}
                                                                    >
                                                                        <i className="fas fa-download" style={{ fontSize: '16px' }}></i>
                                                                    </a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Pagination */}
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div className="text-muted">
                                                Showing {indexOfFirstFile + 1} to {Math.min(indexOfLastFile, filteredFiles.length)} of {filteredFiles.length} entries
                                            </div>
                                            <nav>
                                                <ul className="pagination pagination-sm mb-0">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                                                    </li>
                                                    {[...Array(totalPages)].map((_, i) => (
                                                        <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                                            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
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
            </div>
        </div>
    );
};

// Helper function to format file sizes
const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default AdminDashboard;