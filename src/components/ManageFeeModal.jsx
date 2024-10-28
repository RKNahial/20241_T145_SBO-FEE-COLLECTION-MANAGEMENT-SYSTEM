// src/components/ManageFeeModal.jsx
import React, { useState, useEffect } from 'react';

const ManageFeeModal = ({ isOpen, onClose, onSave, studentName }) => {
    const [amountPaid, setAmountPaid] = useState('');
    const [status, setStatus] = useState('Not Paid');
    const [paymentCategory, setPaymentCategory] = useState('College Shirt');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const [hoverReceipt, setHoverReceipt] = useState(false);
    const [hoverSave, setHoverSave] = useState(false);
    const [hoverCancel, setHoverCancel] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            setDate(now.toISOString().split('T')[0]);
            setTime(now.toTimeString().split(' ')[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = (e) => {
        if (e.target.id === 'modal') {
            onClose();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ amountPaid, status, date, time, paymentCategory });
        setAmountPaid('');
        setStatus('Not Paid');
        setPaymentCategory('College Shirt');
        setDate('');
        setTime('');
        onClose();
    };

    return (
        <div id="modal" onClick={handleClose} style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <i className="fa-solid fa-pen me-2"></i>
                    <h2 style={{ margin: 0 }}>Update Payment</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '0.60rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Student:</span> {studentName}
                    </div>
                    <div>
                        <label>Status:</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} style={modalStyles.select}>
                            <option value="Not Paid">Not Paid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Fully Paid">Fully Paid</option>
                            <option value="Refunded">Refunded</option>
                        </select>
                    </div>
                    <div>
                        <label>Date:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={modalStyles.input}
                        />
                    </div>
                    <div>
                        <label>Time:</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            style={modalStyles.input}
                        />
                    </div>
                    <div style={modalStyles.row}>
                        <div style={modalStyles.paymentCategoryContainer}>
                            <label>Payment Category:</label>
                            <select
                                value={paymentCategory}
                                onChange={(e) => setPaymentCategory(e.target.value)}
                                style={modalStyles.select}
                            >
                                <option value="College Shirt">College Shirt</option>
                                <option value="Event">Event</option>
                            </select>
                        </div>
                        <div style={modalStyles.totalPriceContainer}>
                            <div style={modalStyles.totalPriceLabel}>
                                Total Price:
                            </div>
                            <div style={modalStyles.nonEditable}>
                                400.00
                            </div>
                        </div>
                    </div>
                    <div style={modalStyles.amountPaidContainer}>
                        <div style={modalStyles.amountPaidInput}>
                            <label>Amount Paid:</label>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                required
                                style={modalStyles.input}
                            />
                        </div>
                        <button 
                            type="button" 
                            style={{
                                ...modalStyles.buttonStyles, 
                                backgroundColor: hoverReceipt ? '#E67E22' : '#FFA500',
                                marginTop: '1.20rem'
                            }} 
                            onMouseEnter={() => setHoverReceipt(true)}
                            onMouseLeave={() => setHoverReceipt(false)}
                            onClick={() => alert('Receipt sent!')}
                        >
                            Send Receipt
                        </button>
                    </div>
                    <div style={modalStyles.buttonContainerRight}>
                        <button 
                            type="submit" 
                            style={{ ...modalStyles.buttonStyles, backgroundColor: hoverSave ? '#E67E22' : '#FF8C00', marginLeft: '10px' }}
                            onMouseEnter={() => setHoverSave(true)}
                            onMouseLeave={() => setHoverSave(false)}
                        >
                            Save
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            style={{ ...modalStyles.buttonStyles, backgroundColor: hoverCancel ? '#cc0000' : 'red', marginLeft: '10px' }}
                            onMouseEnter={() => setHoverCancel(true)}
                            onMouseLeave={() => setHoverCancel(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
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
        borderRadius: '0.3125rem', 
        width: '25rem', 
        boxShadow: '0 0.125rem 0.625rem rgba(0, 0, 0, 0.1)', 
        zIndex: 1060,
    },
    nonEditable: {
        background: '#f0f0f0',
        padding: '0.5rem',      
        borderRadius: '0.25rem',
        textAlign: 'left', 
        minWidth: '5.50rem', 
    },
    input: {
        width: '100%',
        padding: '0.5rem', 
        marginBottom: '0.625rem', 
        borderRadius: '0.25rem', 
        border: '1px solid #ccc',
    },
    select: {
        width: '100%',
        padding: '0.5rem', 
        marginBottom: '0.625rem', 
        borderRadius: '0.25rem', 
        border: '1px solid #ccc',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.625rem', 
    },
    totalPriceLabel: {
        marginTop: '0.60rem',
        marginBottom: '0.30rem', 
    },
    totalPriceContainer: {
        display: 'flex',
        flexDirection: 'column', 
        marginBottom: '1rem', 
    },
    amountPaidContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.625rem', 
    },
    amountPaidInput: {
        flexGrow: 1,
        marginRight: '0.625rem', 
        width: '3rem',
    },
    buttonContainerRight: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '1rem',
    },
    buttonStyles: {
        borderRadius: '0.35rem',
        color: '#EAEAEA',
        border: 'none',
        padding: '0.5rem 1rem',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    },
};

export default ManageFeeModal;