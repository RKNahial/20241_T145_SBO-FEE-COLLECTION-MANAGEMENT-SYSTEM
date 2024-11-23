import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Modal, Button } from 'react-bootstrap';
import Preloader from '../../components/Preloader';
import TreasurerSidebar from './TreasurerSidebar';
import TreasurerNavbar from './TreasurerNavbar';
import axios from 'axios';

const TreasurerFeeCategory = () => {
    // NAV AND SIDEBAR
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    // State for categories
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState({ type: '', category: null });

    // CATEGORY STATUS TAG
    const CategoryStatusTag = ({ status }) => {
        let className;

        switch (status) {
            case 'Active':
                className = 'badge active-status';
                break;
            case 'Archived':
                className = 'badge archived-status';
                break;
            default:
                className = 'badge unknown-status';
        }

        return <span className={className}>{status}</span>;
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/payment-categories');
                if (response.data && response.data.categories) {
                    setCategories(response.data.categories);
                } else {
                    setCategories([]);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch categories');
                setLoading(false);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const filteredCategories = Array.isArray(categories) ? categories.filter(category => {
        const matchesSearch = category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category?.categoryId?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === 'Active') {
            matchesStatus = !category?.isArchived;
        } else if (statusFilter === 'Archived') {
            matchesStatus = category?.isArchived;
        }

        return matchesSearch && matchesStatus;
    }) : [];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    const handleArchiveAction = (category) => {
        setModalAction({
            type: category.isArchived ? 'unarchive' : 'archive',
            category: category
        });
        setShowModal(true);
    };

    const confirmArchiveAction = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8000/api/payment-categories/${modalAction.category._id}/toggle-archive`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data.category) {
                // Log the archive/unarchive action
                await axios.post(
                    'http://localhost:8000/api/history-logs/category-archive',
                    {
                        categoryId: modalAction.category._id,
                        action: modalAction.type.toUpperCase(),
                        categoryDetails: {
                            categoryId: modalAction.category.categoryId,
                            name: modalAction.category.name,
                            totalPrice: modalAction.category.totalPrice
                        }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                setCategories(prev => prev.map(c =>
                    c._id === modalAction.category._id ? response.data.category : c
                ));
                setSuccessMessage(`Payment category successfully ${modalAction.type}d!`);
                setTimeout(() => setSuccessMessage(''), 3000);
            }
        } catch (err) {
            setError(`Failed to ${modalAction.type} payment category`);
        } finally {
            setShowModal(false);
            setModalAction({ type: '', category: null });
        }
    };


    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Payment Categories</title>
            </Helmet>
            <TreasurerNavbar toggleSidebar={toggleSidebar} />
            <div style={{ display: 'flex' }}>
                <TreasurerSidebar isCollapsed={isCollapsed} />
                <div id="layoutSidenav_content" style={{
                    marginLeft: isCollapsed ? '5rem' : '15.625rem',
                    transition: 'margin-left 0.3s',
                    flexGrow: 1,
                    marginTop: '3.5rem'
                }}>
                    <div className="container-fluid px-4 mb-5 form-top">
                        <div className="card mb-4">
                            <div className="card-header">
                                <div className="row align-items-center">
                                    <div className="col col-md-6">
                                        <i className="fa fa-cog me-2"></i> <strong>Payment Category</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="alert alert-success alert-dismissible fade show">
                                        {successMessage}
                                    </div>
                                )}
                                {loading ? (
                                     <Preloader open={loading} />
                                ) : (
                                    <>
                                        {/* Actions and Filters */}
                                        <div className="d-flex justify-content-between mb-3 align-items-center">
                                            <div className="d-flex me-auto">
                                                <Link
                                                    to="/treasurer/manage-fee/payment-category/add-new"
                                                    className="add-button btn btn-sm me-2"
                                                >
                                                    <i className="fa fa-plus me-2"></i>
                                                    Add Payment Category
                                                </Link>
                                            </div>
                                            <div className="d-flex align-items-center me-3">
                                                <label className="me-2 mb-0">Payment Category Status</label>
                                                <div className="dashboard-select" style={{ width: 'auto' }}>
                                                    <select
                                                        className="form-control"
                                                        value={statusFilter}
                                                        onChange={(e) => setStatusFilter(e.target.value)}
                                                    >
                                                        <option value="">All</option>
                                                        <option value="Active">Active</option>
                                                        <option value="Archived">Archived</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <form className="d-flex search-bar" onSubmit={(e) => e.preventDefault()}>
                                                <input
                                                    type="text"
                                                    placeholder="Search payment category"
                                                    className="search-input me-2"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <button type="submit" className="search btn btn-sm">
                                                    <i className="fas fa-search"></i>
                                                </button>
                                            </form>
                                        </div>

                                        {/* Table of Payment Category */}
                                        <table className="table table-bordered table-hover">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Payment Category ID</th>
                                                    <th>Payment Category</th>
                                                    <th>Total Price</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((category, index) => (
                                                    <tr key={category._id}>
                                                        <td>{indexOfFirstItem + index + 1}</td>
                                                        <td>{category.categoryId}</td>
                                                        <td>{category.name}</td>
                                                        <td>₱{category.totalPrice}</td>
                                                        <td>
                                                            <CategoryStatusTag
                                                                status={category.isArchived ? 'Archived' : 'Active'}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="btn-group" role="group">
                                                                <Link
                                                                    to={`/treasurer/manage-fee/payment-category/edit/${category._id}`}
                                                                    className="btn btn-edit btn-sm"
                                                                >
                                                                    <i className="fas fa-edit"></i>
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleArchiveAction(category)}
                                                                    className="btn btn-archive btn-sm"
                                                                >
                                                                    <i className={`fas fa-${!category.isArchived ? 'box-archive' : 'box-open'}`}></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div className="text-muted small">
                                                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCategories.length)} of {filteredCategories.length} entries
                                            </div>
                                            <nav>
                                                <ul className="pagination pagination-sm mb-0">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button
                                                            className="page-link"
                                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                                            disabled={currentPage === 1}
                                                        >
                                                            Previous
                                                        </button>
                                                    </li>
                                                    {[...Array(totalPages)].map((_, index) => (
                                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
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
                                                            onClick={() => setCurrentPage(prev => prev + 1)}
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* COFIRMATION MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {modalAction.type === 'archive' ? 'Archive' : 'Unarchive'} Payment Category
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to {modalAction.type} <strong>{modalAction.category?.name}</strong>?
                    </p>
                    {modalAction.type === 'archive' ? (
                        <small style={{ color: '#6c757d', fontSize: '0.90rem' }}>
                            You can still unarchive the payment category if you change your mind.
                        </small>
                    ) : (
                        <small style={{ color: '#6c757d', fontSize: '0.90rem' }}>
                            This payment category will be active and visible in the system.
                        </small>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="btn btn-confirm"
                        onClick={confirmArchiveAction}
                        style={{ flex: 'none' }}
                    >
                        Confirm
                    </Button>
                    <Button
                        variant="btn btn-cancel"
                        onClick={() => setShowModal(false)}
                        style={{ marginRight: '0.5rem', flex: 'none' }}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default TreasurerFeeCategory;