import { Helmet } from 'react-helmet';
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
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
    const [showModal, setShowModal] = useState(false);
    const [pendingFormData, setPendingFormData] = useState(null);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setPendingFormData({
            name: formData.name,
            totalPrice: Number(formData.totalPrice),
            categoryId: formData.categoryId
        });
        setShowModal(true);
    };

    const confirmUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:8000/api/payment-categories/${id}`,
                {
                    name: pendingFormData.name,
                    totalPrice: Number(pendingFormData.totalPrice)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Log the category update
            await axios.post(
                'http://localhost:8000/api/history-logs/category-update',
                {
                    categoryId: id,
                    previousData: {
                        name: formData.name,
                        totalPrice: formData.totalPrice,
                        categoryId: formData.categoryId
                    },
                    newData: {
                        name: pendingFormData.name,
                        totalPrice: pendingFormData.totalPrice,
                        categoryId: formData.categoryId
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccessMessage('Category updated successfully!');
            setShowModal(false);
            setTimeout(() => {
                navigate('/treasurer/manage-fee/payment-category');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update category');
            setShowModal(false);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // For totalPrice, only allow positive numbers
        if (name === 'totalPrice' && value < 0) {
            return;
        }

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
                                                <button type="submit" className="btn system-button update-button">
                                                    <i className="fa-solid fa-pen me-1"></i> Update
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
            {/* CONFIRMATION MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Update Payment Category
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-1">
                        Are you sure you want to update this payment category?
                    </p>
                    {pendingFormData && (
                        <div className="mt-3">
                            <p className="mb-1"><strong>Category ID:</strong> {pendingFormData.categoryId}</p>
                            <p className="mb-1"><strong>Name:</strong> {pendingFormData.name}</p>
                            <p className="mb-1"><strong>Total Price:</strong> ₱{pendingFormData.totalPrice}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="btn btn-confirm"
                        onClick={confirmUpdate}
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

export default TreasurerEditCategory;