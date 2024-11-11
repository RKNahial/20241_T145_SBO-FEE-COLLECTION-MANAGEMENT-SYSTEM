// src/components/ViewFeeModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewFeeModal = ({ isOpen, onClose, student }) => {
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (isOpen && student) {
                try {
                    const response = await axios.get(`http://localhost:8000/api/payment-fee/details/${student._id}`);
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
    }, [isOpen, student]);

    if (!isOpen) return null;

    const handleClose = (e) => {
        if (e.target.id === 'modal') {
            onClose();
        }
    };

    const handleSendEmail = async () => {
        if (!student.institutionalEmail || !paymentDetails) return;

        try {
            const response = await axios.post('http://localhost:8000/api/email/send-payment-details', {
                studentEmail: student.institutionalEmail,
                paymentDetails,
                studentName: student.name
            });

            if (response.data.success) {
                alert('Payment details sent successfully to student\'s email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email');
        }
    };

    return (
        <div id="modal" onClick={handleClose} style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <i className="fa-solid fa-eye me-2"></i>
                    <h2 style={{ margin: 0 }}>View Payment Details</h2>
                </div>

                {loading ? (
                    <div>Loading payment details...</div>
                ) : error ? (
                    <div style={{ color: 'red' }}>{error}</div>
                ) : (
                    <>
                        <div style={modalStyles.row}>
                            <span style={{ fontWeight: 'bold' }}>Student:</span> {student.name}
                        </div>
                        <div style={modalStyles.row}>
                            <span style={{ fontWeight: 'bold' }}>Payment Status:</span> {student.paymentstatus}
                        </div>
                        <div style={modalStyles.row}>
                            <span style={{ fontWeight: 'bold' }}>Payment Category:</span>
                            {paymentDetails?.paymentCategory || 'N/A'}
                        </div>
                        <div style={modalStyles.row}>
                            <span style={{ fontWeight: 'bold' }}>Total Price:</span>
                            ₱{paymentDetails?.totalPrice?.toFixed(2) || '0.00'}
                        </div>
                        <div style={modalStyles.row}>
                            <span style={{ fontWeight: 'bold' }}>Amount Paid:</span>
                            ₱{paymentDetails?.amountPaid?.toFixed(2) || '0.00'}
                        </div>

                        {/* Transaction History */}
                        <div style={modalStyles.section}>
                            <h3 style={modalStyles.sectionTitle}>Transaction History</h3>
                            {paymentDetails?.transactions?.length > 0 ? (
                                <div style={modalStyles.transactionList}>
                                    {paymentDetails.transactions.map((transaction, index) => (
                                        <div key={index} style={modalStyles.transaction}>
                                            <div>Amount: ₱{transaction.amount.toFixed(2)}</div>
                                            <div>Date: {transaction.formattedDate}</div>
                                            <div>Status Change: {transaction.previousStatus || 'New'} → {transaction.newStatus}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>No transaction history available</div>
                            )}
                        </div>

                        <div style={modalStyles.buttonContainerRight}>
                            <button
                                type="button"
                                onClick={handleSendEmail}
                                style={{
                                    ...modalStyles.buttonStyles,
                                    backgroundColor: '#28a745',
                                    marginRight: '0.5rem'
                                }}
                            >
                                Send Email
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ ...modalStyles.buttonStyles, backgroundColor: '#DC3545' }}
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
    },
    modal: {
        background: 'white',
        padding: '1.25rem',
        borderRadius: '1rem',
        width: '25rem',
        boxShadow: '0 0.125rem 0.625rem rgba(0, 0, 0, 0.1)',
        zIndex: 1060,
    },
    row: {
        marginBottom: '0.625rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonContainerRight: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    buttonStyles: {
        borderRadius: '0.35rem',
        color: '#EAEAEA',
        border: 'none',
        padding: '0.5rem 1rem',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    },
    section: {
        marginTop: '1rem',
        borderTop: '1px solid #dee2e6',
        paddingTop: '1rem'
    },
    sectionTitle: {
        fontSize: '1rem',
        marginBottom: '0.5rem'
    },
    transactionList: {
        maxHeight: '200px',
        overflowY: 'auto'
    },
    transaction: {
        padding: '0.5rem',
        marginBottom: '0.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '0.25rem',
        fontSize: '0.875rem'
    }
};

export default ViewFeeModal;