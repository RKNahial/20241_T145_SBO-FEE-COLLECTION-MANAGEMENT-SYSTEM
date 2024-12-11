import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import LoadingSpinner from '../../components/LoadingSpinner';
import { Helmet } from 'react-helmet';
import { getAnalytics, logEvent } from "firebase/analytics";
import { app } from '../firebase/firebaseConfig';

const TreasurerFileUpload = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const itemsPerPage = 10;
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const analytics = getAnalytics(app);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/drive/files', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFiles(response.data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
            if (error.response?.status === 401) {
                console.log('Unauthorized access. Please login again.');
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setSelectedFile(file);
            handleFileUpload(file);
        }
    };

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

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        logEvent(analytics, 'page_view', {
            page_title: 'Treasurer File Upload',
            page_location: window.location.href,
            page_path: window.location.pathname,
            user_role: 'treasurer'
        });
    }, []);

    // Filter files based on search term
    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentFiles = filteredFiles.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);

    const actionButtonStyle = {
        width: '35px',
        height: '35px',
        padding: '0',
        margin: '0 4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        border: 'none',
        transition: 'all 0.2s ease',
    };

    return (
        <div className="sb-nav-fixed">
            <style>
                {`
                    .table-hover .no-hover:hover {
                        background-color: transparent !important;
                    }
                    .pagination .page-item.active .page-link {
                        background-color: #ff7f00 !important;
                        border-color: #ff7f00 !important;
                    }
                    .upload-container {
                        border: 2px dashed #ccc;
                        border-radius: 10px;
                        padding: 20px;
                        text-align: center;
                        background-color: #f8f9fa;
                        transition: all 0.3s ease;
                        cursor: pointer;
                        margin-bottom: 20px;
                    }
                    .upload-container:hover, .upload-container.drag-active {
                        border-color: #ff7f00;
                        background-color: #fff5e6;
                    }
                    .upload-icon {
                        font-size: 2rem;
                        color: #ff7f00;
                        margin-bottom: 10px;
                    }
                    .upload-text {
                        color: #666;
                        margin-bottom: 5px;
                    }
                    .upload-subtext {
                        color: #999;
                        font-size: 0.9rem;
                    }
                    .search-container {
                        position: relative;
                        margin-bottom: 20px;
                    }
                    .search-container i {
                        position: absolute;
                        left: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #666;
                    }
                    .search-input {
                        padding-left: 35px;
                        border-radius: 20px;
                        border: 1px solid #ddd;
                        width: 100%;
                        max-width: 300px;
                    }
                    .progress {
                        height: 10px;
                        border-radius: 5px;
                        margin-top: 10px;
                    }
                    .progress-bar {
                        background-color: #ff7f00;
                        transition: width 0.3s ease;
                    }
                `}
            </style>
            <Helmet>
                <title>File Management | SFCM</title>
            </Helmet>
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
                <div
                    id="layoutSidenav_content"
                    style={{
                        marginLeft: isCollapsed ? '5rem' : '15.625rem',
                        marginRight: '0rem',
                        transition: 'margin-left 0.3s',
                        flexGrow: 1,
                        marginTop: '3.5rem'
                    }}
                >
                    <div className="container-fluid px-5 mb-5">
                        <p className="system-gray mt-4 welcome-text">File Management</p>
                        <div className="row mb-4">
                            <div className="col">
                                <div className="card">
                                    <div className="card-body">
                                        {/* Upload Section */}
                                        <div
                                            className={`upload-container ${dragActive ? 'drag-active' : ''}`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={handleUploadClick}
                                        >
                                            <i className="fas fa-cloud-upload-alt upload-icon"></i>
                                            <h5 className="upload-text">Drag and drop files here or click to upload</h5>
                                            <p className="upload-subtext">Supported files: PDF, DOC, DOCX, XLS, XLSX</p>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                style={{ display: 'none' }}
                                                onChange={handleFileSelect}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx"
                                            />
                                        </div>

                                        {loading && <LoadingSpinner />}

                                        {uploadProgress > 0 && (
                                            <div className="progress">
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

                                        {/* Search Section */}
                                        <div className="search-container">
                                            <i className="fas fa-search"></i>
                                            <input
                                                type="text"
                                                className="form-control search-input"
                                                placeholder="Search files..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>

                                        {/* Files Table */}
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>File Name</th>
                                                        <th>Size</th>
                                                        <th>Last Modified</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentFiles.map((file) => (
                                                        <tr key={file.id}>
                                                            <td>
                                                                <i className={`fas fa-file-${getFileIcon(file.name)} me-2 text-muted`}></i>
                                                                {file.name}
                                                            </td>
                                                            <td>{formatFileSize(file.size)}</td>
                                                            <td>{new Date(file.modifiedTime).toLocaleDateString()}</td>
                                                            <td>
                                                                <a
                                                                    href={file.webViewLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm btn-primary me-2"
                                                                    style={actionButtonStyle}
                                                                    title="View File"
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </a>
                                                                <a
                                                                    href={file.webContentLink}
                                                                    className="btn btn-sm btn-success"
                                                                    download
                                                                    style={actionButtonStyle}
                                                                    title="Download File"
                                                                >
                                                                    <i className="fas fa-download"></i>
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="d-flex justify-content-end mt-3">
                                            <nav>
                                                <ul className="pagination">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
            </div>
        </div>
    );
};

// Helper function to determine file icon
const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
        case 'pdf':
            return 'pdf';
        case 'doc':
        case 'docx':
            return 'word';
        case 'xls':
        case 'xlsx':
            return 'excel';
        default:
            return 'alt';
    }
};

export default TreasurerFileUpload;
