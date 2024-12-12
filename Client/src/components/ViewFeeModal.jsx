import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import LoadingSpinner from './LoadingSpinner';

const ViewFeeModal = ({ isOpen, onClose, student, categoryId, onEmailSuccess }) => {
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (!isOpen || !student || !categoryId) return;

            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('token');
                const url = `http://localhost:8000/api/payment-fee/details/${student._id}?category=${categoryId}`;
                
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.success) {
                    setPaymentDetails(response.data.paymentFee);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch payment details');
                }
            } catch (error) {
                setError(error.message || 'Failed to fetch payment details');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [isOpen, student, categoryId]);

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Fully Paid': return 'success';
            case 'Partially Paid': return 'warning';
            default: return 'danger';
        }
    };

    if (!isOpen || !student) return null;

    return (
        <Modal show={isOpen} onHide={onClose} size="lg" className="fee-modal">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="text-navy fw-bold"><i className="fas fa-money-bill-wave" style={{ color: 'orange' }}></i> Payment Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                {loading ? (
                    <div className="text-center py-5">
                        <LoadingSpinner icon="file" />
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="mb-0">{error}</Alert>
                ) : paymentDetails ? (
                    <div className="fee-details">
                        <section className="info-section mb-4">
                            <h6 className="section-title mb-3">Student Information</h6>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label"><i className="fas fa-user-graduate"></i> Name</span>
                                    <span className="value">{student.name}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label"><i className="fas fa-id-card"></i> Student ID</span>
                                    <span className="value">{student.studentId}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label"><i className="fas fa-book"></i> Program</span>
                                    <span className="value">{student.program}</span>
                                </div>
                            </div>
                        </section>

                        <section className="info-section mb-4">
                            <h6 className="section-title mb-3">Payment Information</h6>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label"><i className="fas fa-tags"></i> Category</span>
                                    <span className="value">{paymentDetails.paymentCategory}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label"><i className="fas fa-money-bill-wave"></i> Total Amount</span>
                                    <span className="value">₱{paymentDetails.totalPrice?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label"><i className="fas fa-wallet"></i> Amount Paid</span>
                                    <span className="value">₱{paymentDetails.amountPaid?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label"><i className="fas fa-info-circle"></i> Status</span>
                                    <span className={`status-badge status-${getStatusVariant(paymentDetails.status)}`}>
                                        {paymentDetails.status}
                                    </span>
                                </div>
                                {paymentDetails.paymentDate && (
                                    <div className="info-item">
                                        <span className="label"><i className="fas fa-calendar-alt"></i> Last Payment</span>
                                        <span className="value">{new Date(paymentDetails.paymentDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        {paymentDetails.transactions?.length > 0 && (
                            <section className="info-section">
                                <h6 className="section-title mb-3">Transaction History</h6>
                                <div className="transaction-list">
                                    {paymentDetails.transactions.map((transaction, index) => (
                                        <div key={index} className="transaction-item">
                                            <div className="transaction-header">
                                                <span className="amount">₱{transaction.amount?.toFixed(2)}</span>
                                                <span className="date">{new Date(transaction.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="status-change">
                                                <span className={`status-badge status-${getStatusVariant(transaction.previousStatus)}`}>
                                                    {transaction.previousStatus}
                                                </span>
                                                <i className="fas fa-arrow-right mx-2"></i>
                                                <span className={`status-badge status-${getStatusVariant(transaction.newStatus)}`}>
                                                    {transaction.newStatus}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <Alert variant="info" className="mb-0">No payment details available.</Alert>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <button className="btn btn-orange" onClick={onClose}>
                    Close
                </button>
            </Modal.Footer>
            <style jsx>{`
                .fee-modal .modal-content {
                    background: linear-gradient(to right, #fff3e0, #ffffff);
                    border-radius: 15px;
                    border: none;
                    box-shadow: 0 6px 40px rgba(0, 0, 0, 0.15);
                    transition: all 0.3s ease-in-out;
                }

                .section-title {
                    color: #003366;
                    font-weight: 700;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 1.5rem;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 1.75rem;
                }

                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    background: #ffffff;
                    padding: 1rem;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                }

                .label {
                    color: #FF8C00;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .value {
                    color: #003366;
                    font-size: 0.95rem;
                    font-weight: 600;
                }

                .status-badge {
                    display: inline-block;
                    padding: 0.35rem 0.85rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .status-success {
                    background-color: #c8e6c9;
                    color: #2e7d32;
                }

                .status-warning {
                    background-color: #fff9c4;
                    color: #f57f17;
                }

                .status-danger {
                    background-color: #ffcdd2;
                    color: #c62828;
                }

                .transaction-list {
                    max-height: 320px;
                    overflow-y: auto;
                    padding-right: 0.5rem;
                }

                .transaction-list::-webkit-scrollbar {
                    width: 6px;
                }

                .transaction-list::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }

                .transaction-list::-webkit-scrollbar-thumb {
                    background: #b0bec5;
                    border-radius: 3px;
                }

                .transaction-item {
                    background: #ffffff;
                    border-radius: 10px;
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                    transition: all 0.2s ease;
                    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
                }

                .transaction-item:hover {
                    background: #f4f6f8;
                    transform: translateY(-2px);
                }

                .transaction-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }

                .amount {
                    font-weight: 700;
                    color: #2c3e50;
                }

                .date {
                    color: #95a5a6;
                    font-size: 0.9rem;
                }

                .status-change {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .btn-orange {
                    color: #ffffff;
                    background: #FF8C00;
                    border: none;
                    padding: 0.6rem 1.5rem;
                    font-weight: 600;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .btn-orange:hover {
                    background: #e07b00;
                    color: #ffffff;
                }
            `}</style>
        </Modal>
    );
};

export default ViewFeeModal;