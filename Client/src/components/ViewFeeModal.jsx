import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import Preloader from '../components/Preloader';

const ViewFeeModal = ({ isOpen, onClose, student, categoryId, onEmailSuccess }) => {
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingEmail, setSendingEmail] = useState(false); 
    const isTreasurer = localStorage.getItem('userRole') === 'Treasurer';

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (isOpen && student) {
                try {
                    const token = localStorage.getItem('token');
                    const url = categoryId
                        ? `http://localhost:8000/api/payment-fee/details/${student._id}?category=${categoryId}`
                        : `http://localhost:8000/api/payment-fee/details/${student._id}`;
                    const response = await axios.get(url, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (response.data.success) {
                        setPaymentDetails(response.data.paymentFee);
                    } else {
                        throw new Error(response.data.message);
                    }
                } catch (error) {
                    console.error('Error fetching payment details:', error);
                    setError(error.message || 'Failed to fetch payment details');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (isOpen) {
            fetchPaymentDetails();
        }
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
            payment_status: student.paymentstatus,
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
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : (
                    <>
                        {sendingEmail && !error && <Preloader open={sendingEmail} />}
                        <Row className="mb-3">
                            <Col xs={5} className="fw-bold">Student:</Col>
                            <Col>{student.name}</Col>
                        </Row>
                        <Row className="mb-3">
                            <Col xs={5} className="fw-bold">Payment Status:</Col>
                            <Col>{student.paymentstatus}</Col>
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
            </Modal.Body>

            <Modal.Footer className="border-0 px-4 pb-4">
                {isTreasurer && (
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