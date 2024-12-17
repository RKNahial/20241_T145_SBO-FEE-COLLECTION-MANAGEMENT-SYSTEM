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
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    const isTreasurer = userDetails?.position === 'Treasurer';
    console.log('Current user details:', userDetails);
    console.log('Is Treasurer:', isTreasurer);
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Payment Details:', paymentDetails);

    // Add payment status calculation
    const calculatePaymentStatus = (details) => {
        if (!details) return 'Not Paid';
        const amountPaid = parseFloat(details.amountPaid) || 0;
        const totalPrice = parseFloat(details.totalPrice) || 0;
        
        // Ensure we're comparing numbers and handling edge cases
        if (totalPrice <= 0) return 'Not Paid';
        if (amountPaid >= totalPrice) return 'Fully Paid';
        if (amountPaid > 0) return 'Partially Paid';
        return 'Not Paid';
    };

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (!isOpen) {
                setPaymentDetails(null);
                setLoading(false);
                return;
            }

            if (!student || !categoryId) {
                setPaymentDetails(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                
                const url = `http://localhost:8000/api/payment-fee/details/${student._id}?category=${categoryId}`;
                console.log('Fetching payment details with URL:', url);
                
                const response = await axios.get(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.data.success) {
                    const details = response.data.paymentFee;
                    // Calculate the payment status
                    details.status = calculatePaymentStatus(details);
                    console.log('Received payment details:', details);
                    setPaymentDetails(details);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch payment details');
                }
            } catch (error) {
                console.error('Error fetching payment details:', error);
                setError(error.message || 'Failed to fetch payment details');
                setPaymentDetails(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [isOpen, student, categoryId]);

    const handleSendEmail = async () => {
        if (!student.institutionalEmail || !paymentDetails) return;

        setSendingEmail(true); 

        const templateParams = {
            from_name: "COT-SBO COLLECTION FEE MANAGEMENT SYSTEM",
            to_name: student.name,
            to_email: student.institutionalEmail,
            payment_category: paymentDetails.paymentCategory || 'N/A',
            total_price: paymentDetails.totalPrice?.toString() || '0.00',
            amount_paid: paymentDetails.amountPaid?.toString() || '0.00',
            payment_status: paymentDetails.status,
            transaction_history: paymentDetails.transactions?.map(t =>
                `• Amount: ₱${t.amount.toFixed(2)}\n  Date: ${t.formattedDate}\n  Status: ${t.previousStatus || 'New'} → ${t.newStatus}`
            ).join('\n\n') || 'No transaction history'
        };

        try {
            const response = await emailjs.send(
                "service_bni941i",
                "template_x5s32eh",
                templateParams,
                "Nqbgnjhv9ss88DOrk"
            );

            if (response.status === 200) {
                onEmailSuccess(`Payment details emailed to ${student.name}'s successfully!`);
                onClose(); 
            }
        } catch (error) {
            console.error('Error sending email:', error);
            // Optionally handle the error here (e.g., set an error state)
        } finally {
            setSendingEmail(false); 
        }
    };

    return (
        <Modal
            show={isOpen}
            onHide={onClose}
            centered
            size="md"
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton className="border-0">
                <Modal.Title>
                    <i className="fa-solid fa-eye me-2"></i>
                    View Payment Details
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4">
            {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        minHeight: '200px'
                    }}>
                        <LoadingSpinner text="Loading payment details..." />
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : sendingEmail ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        minHeight: '200px'
                    }}>
                        <LoadingSpinner text="Sending Email" icon="envelope" />
                    </div>
                ) : !student ? (
                    <Alert variant="warning">No student data available</Alert>
                ) : (
                    <>
                        <Row className="mb-3">
                            <Col xs={5} className="fw-bold">Student:</Col>
                            <Col>{student.name}</Col>
                        </Row>
                        {!categoryId ? (
                            <Row className="mb-3">
                                <Col>
                                    <Alert variant="warning">
                                        Please select a payment category to view details.
                                    </Alert>
                                </Col>
                            </Row>
                        ) : (
                            <>
                                <Row className="mb-3">
                                    <Col xs={5} className="fw-bold">Payment Status:</Col>
                                    <Col>{calculatePaymentStatus(paymentDetails)}</Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col xs={5} className="fw-bold">Payment Category:</Col>
                                    <Col>{paymentDetails?.paymentCategory || 'N/A'}</Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col xs={5} className="fw-bold">Total Price:</Col>
                                    <Col>₱{paymentDetails?.totalPrice?.toFixed(2) || '0.00'}</Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col xs={5} className="fw-bold">Amount Paid:</Col>
                                    <Col>₱{paymentDetails?.amountPaid?.toFixed(2) || '0.00'}</Col>
                                </Row>

                                <div className="mt-4 pt-3 border-top">
                                    <h5 className="mb-3">Transaction History</h5>
                                    {paymentDetails?.transactions?.length > 0 ? (
                                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                            {paymentDetails.transactions.map((transaction, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 mb-2 bg-light rounded"
                                                    style={{ fontSize: '0.875rem' }}
                                                >
                                                    <div>Amount: ₱{transaction.amount.toFixed(2)}</div>
                                                    <div>Date: {transaction.formattedDate}</div>
                                                    <div>Status Change: {transaction.previousStatus || 'New'} → {transaction.newStatus}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-muted">No transaction history available</div>
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </Modal.Body>

            <Modal.Footer className="border-0 px-4 pb-4">
            {isTreasurer && !loading && !error && (  
                    <Button
                        variant="btn btn-confirm"   
                        onClick={handleSendEmail}
                        className="me-2"
                        disabled={sendingEmail}
                    >
                        {sendingEmail ? 'Sending...' : 'Send Email'}
                    </Button>
                )}
                <Button
                    variant="btn btn-cancel"
                    onClick={onClose}
                    disabled={sendingEmail}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ViewFeeModal;