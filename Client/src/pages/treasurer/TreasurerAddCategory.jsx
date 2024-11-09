import { Helmet } from 'react-helmet';
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import axios from 'axios';

const TreasurerAddCategory = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [categoryId, setCategoryId] = useState(null);

    const [formData, setFormData] = useState({
        categoryId: '',
        name: '',
        totalPrice: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/payment-categories', {
                categoryId: formData.categoryId,
                name: formData.name,
                totalPrice: Number(formData.totalPrice)
            });
            setSuccessMessage('Category added successfully!');
            setCategoryId(response.data.category._id);
            setTimeout(() => {
                navigate('/treasurer/manage-fee/payment-category');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add category');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Add Payment Category</title>
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
                        <div className="row">
                            <div className="col-md-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <i className="fa fa-plus me-2"></i> <strong>Add Payment Category</strong>
                                    </div>
                                    <div className="card-body">
                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}
                                        {successMessage && (
                                            <div className="alert alert-success" role="alert">
                                                {successMessage}
                                                {categoryId && <div>Category ID: {categoryId}</div>}
                                            </div>
                                        )}
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Category ID</label>
                                                <input
                                                    type="text"
                                                    name="categoryId"
                                                    value={formData.categoryId}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter category ID"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Payment Category</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter payment category"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="mb-1">Total Price</label>
                                                <input
                                                    type="number"
                                                    name="totalPrice"
                                                    value={formData.totalPrice}
                                                    onChange={handleChange}
                                                    className="form-control system"
                                                    placeholder="Enter total price"
                                                    required
                                                />
                                            </div>
                                            <div className="mb-0">
                                                <button type="submit" className="btn system-button">
                                                    <i className="fa-solid fa-pen me-1"></i> Add
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

export default TreasurerAddCategory;