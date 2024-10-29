// src/components/ViewFeeModal.jsx
import React, { useState, useEffect } from 'react';

const paymentPrices = {
    "College Shirt": 400.00,
    "Event": 200.00, // Add other categories and their prices as needed
};

const ViewFeeModal = ({ isOpen, onClose, student }) => {
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        if (isOpen && student) {
            setTotalPrice(paymentPrices[student.paymentCategory] || 0);
        }
    }, [isOpen, student]);

    if (!isOpen) return null;

    const handleClose = (e) => {
        if (e.target.id === 'modal') {
            onClose();
        }
    };

    return (
        <div id="modal" onClick={handleClose} style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <i className="fa-solid fa-eye me-2"></i>
                    <h2 style={{ margin: 0 }}>View Payment Details</h2>
                </div>
                <div style={modalStyles.row}>
                    <span style={{ fontWeight: 'bold' }}>Student:</span> {student.name}
                </div>
                <div style={modalStyles.row}>
                    <span style={{ fontWeight: 'bold' }}>Payment Status:</span> {student.paymentStatus}
                </div>
                <div style={modalStyles.row}>
                    <span style={{ fontWeight: 'bold' }}>Date:</span> {student.date || 'N/A'}
                </div>
                <div style={modalStyles.row}>
                    <span style={{ fontWeight: 'bold' }}>Payment Category:</span> {student.paymentCategory}
                </div>
                <div style={modalStyles.row}>
                    <span style={{ fontWeight: 'bold' }}>Total Price:</span> {totalPrice.toFixed(2)}
                </div>
                <div style={modalStyles.row}>
                    <span style={{ fontWeight: 'bold' }}>Amount Paid:</span> {student.amountPaid ? student.amountPaid.toFixed(2) : 'N/A'}
                </div>
                <div style={modalStyles.buttonContainerRight}>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        style={{ ...modalStyles.buttonStyles, backgroundColor: 'red', marginTop: '1rem' }}
                    >
                        Close
                    </button>
                </div>
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
};

export default ViewFeeModal;