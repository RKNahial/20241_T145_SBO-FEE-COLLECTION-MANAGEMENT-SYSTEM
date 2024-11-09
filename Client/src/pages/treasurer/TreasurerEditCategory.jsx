import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import TreasurerSidebar from "./TreasurerSidebar";
import TreasurerNavbar from "./TreasurerNavbar";
import axios from 'axios';

const TreasurerEditCategory = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        totalPrice: '',
        categoryId: ''
    });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/payment-categories/${id}`);
                const category = response.data;
                setFormData({
                    name: category.name,
                    totalPrice: category.totalPrice,
                    categoryId: category.categoryId
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch category details');
                setLoading(false);
            }
        };
        fetchCategory();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/api/payment-categories/${id}`, {
                name: formData.name,
                totalPrice: Number(formData.totalPrice)
            });
            setSuccessMessage('Category updated successfully!');
            setTimeout(() => {
                navigate('/treasurer/manage-fee/payment-category');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update category');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="sb-nav-fixed">
            <Helmet>
                <title>Treasurer | Edit Payment Category</title>
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
                                        <i className="fas fa-edit me-2"></i>
                                        <strong>Edit Payment Category</strong>
                                    </div>
                                    <div className="card-body">
                                        {error && (
                                            <div className="alert alert-danger">{error}</div>
                                        )}
                                        {successMessage && (
                                            <div className="alert alert-success">{successMessage}</div>
                                        )}
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="mb-1">Category ID</label>
                                                <input
                                                    type="text"
                                                    value={formData.categoryId}
                                                    className="form-control"
                                                    disabled
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
                                                    required
                                                />
                                            </div>
                                            <div className="mb-0">
                                                <button type="submit" className="btn btn-warning w-100 text-white">
                                                    <i className="fas fa-save me-1"></i> Save Changes
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

export default TreasurerEditCategory;