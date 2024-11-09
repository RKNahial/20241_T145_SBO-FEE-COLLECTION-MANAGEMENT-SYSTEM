import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import TreasurerSidebar from './TreasurerSidebar';
import TreasurerNavbar from './TreasurerNavbar';
import axios from 'axios';

const TreasurerFeeCategory = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/payment-categories');
                setCategories(Array.isArray(response.data.categories) ? response.data.categories : []);
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

    const handleArchiveToggle = async (id) => {
        try {
            const category = categories.find(c => c._id === id);
            await axios.put(`http://localhost:8000/api/payment-categories/${id}`, {
                ...category,
                isArchived: !category.isArchived
            });

            setCategories(prev => prev.map(c =>
                c._id === id ? { ...c, isArchived: !c.isArchived } : c
            ));
            setSuccessMessage('Category status updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to update category status');
        }
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Payment Categories</title>
            </Helmet>
            <TreasurerNavbar toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
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
                                    <div className="col">
                                        <i className="fas fa-cog me-2"></i>
                                        <strong>Payment Category</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body">
                                {successMessage && (
                                    <div className="alert alert-success alert-dismissible fade show">
                                        {successMessage}
                                        <button type="button" className="btn-close" onClick={() => setSuccessMessage("")}></button>
                                    </div>
                                )}

                                <div className="d-flex justify-content-between mb-3">
                                    <div className="d-flex align-items-center">
                                        <Link to="/treasurer/manage-fee/payment-category/add-new"
                                            className="btn btn-primary btn-sm me-2">
                                            <i className="fas fa-plus me-2"></i>
                                            Add Payment Category
                                        </Link>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <label className="me-2 mb-0">Payment Category Status:</label>
                                        <select
                                            className="form-select form-select-sm me-2"
                                            style={{ width: 'auto' }}
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="">All</option>
                                            <option value="Active">Active</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                        <div className="input-group input-group-sm" style={{ width: '200px' }}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search payment category"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <button className="btn btn-outline-secondary">
                                                <i className="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-responsive">
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
                                                        <span className={`badge ${!category.isArchived ? 'bg-success' : 'bg-secondary'}`}>
                                                            {!category.isArchived ? 'Active' : 'Archived'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group" role="group">
                                                            <Link
                                                                to={`/treasurer/manage-fee/payment-category/edit/${category._id}`}
                                                                className="btn btn-sm btn-success"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </Link>
                                                            <button
                                                                onClick={() => handleArchiveToggle(category._id)}
                                                                className="btn btn-sm btn-danger"
                                                            >
                                                                <i className={`fas fa-${!category.isArchived ? 'box-archive' : 'box-open'}`}></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreasurerFeeCategory;