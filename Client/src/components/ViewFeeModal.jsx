import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
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
            if (!isOpen || !student || !categoryId) {
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('token');
                const url = `http://localhost:8000/api/payment-fee/details/${student._id}?category=${categoryId}`;
                
                console.log('Fetching payment details:', url);
                
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.success) {
                    console.log('Payment details received:', response.data);
                    setPaymentDetails(response.data.paymentFee);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch payment details');
                }
            } catch (error) {
                console.error('Error fetching payment details:', error);
                setError(error.message || 'Failed to fetch payment details');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [isOpen, student, categoryId]);

    if (!isOpen || !student) return null;

    return (
        <Modal show={isOpen} onHide={onClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Payment Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <LoadingSpinner />
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : paymentDetails ? (
                    <div>
                        <Row className="mb-3">
                            <Col>
                                <h5>Student Information</h5>
                                <p><strong>Name:</strong> {student.name}</p>
                                <p><strong>Student ID:</strong> {student.studentId}</p>
                                <p><strong>Program:</strong> {student.program}</p>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col>
                                <h5>Payment Information</h5>
                                <p><strong>Category:</strong> {paymentDetails.paymentCategory}</p>
                                <p><strong>Total Amount:</strong> ₱{paymentDetails.totalPrice?.toFixed(2) || '0.00'}</p>
                                <p><strong>Amount Paid:</strong> ₱{paymentDetails.amountPaid?.toFixed(2) || '0.00'}</p>
                                <p><strong>Status:</strong> <span className={`badge ${paymentDetails.status === 'Fully Paid' ? 'bg-success' : paymentDetails.status === 'Partially Paid' ? 'bg-warning' : 'bg-danger'}`}>{paymentDetails.status}</span></p>
                                {paymentDetails.paymentDate && (
                                    <p><strong>Last Payment Date:</strong> {new Date(paymentDetails.paymentDate).toLocaleDateString()}</p>
                                )}
                            </Col>
                        </Row>
                        {paymentDetails.transactions && paymentDetails.transactions.length > 0 && (
                            <Row>
                                <Col>
                                    <h5>Transaction History</h5>
                                    <div className="transaction-history">
                                        {paymentDetails.transactions.map((transaction, index) => (
                                            <div key={index} className="transaction-item mb-2 p-2 border rounded">
                                                <p className="mb-1"><strong>Amount:</strong> ₱{transaction.amount?.toFixed(2)}</p>
                                                <p className="mb-1"><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}</p>
                                                <p className="mb-1"><strong>Status Change:</strong> {transaction.previousStatus} → {transaction.newStatus}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </div>
                ) : (
                    <Alert variant="info">No payment details available.</Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
            <style>
                {`
                    .transaction-history {
                        max-height: 200px;
                        overflow-y: auto;
                    }
                    .transaction-item {
                        background-color: #f8f9fa;
                    }
                    .badge {
                        padding: 0.5em 1em;
                    }
                `}
            </style>
        </Modal>
    );
};

export default ViewFeeModal;