// src/components/ManageFeeModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageFeeModal = ({ isOpen, onClose, onSave, studentName, selectedStudent }) => {
    const [paymentCategories, setPaymentCategories] = useState([]);
    const [amountPaid, setAmountPaid] = useState('');
    const [status, setStatus] = useState('Not Paid');
    const [paymentCategory, setPaymentCategory] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const [hoverSave, setHoverSave] = useState(false);
    const [hoverCancel, setHoverCancel] = useState(false);

    useEffect(() => {
        const fetchPaymentCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/payment-categories');
                const activeCategories = response.data.categories.filter(category => !category.isArchived);
                setPaymentCategories(activeCategories);
                if (activeCategories.length > 0) {
                    setPaymentCategory(activeCategories[0].name);
                }
            } catch (err) {
                console.error('Failed to fetch payment categories:', err);
            }
        };

        if (isOpen) {
            fetchPaymentCategories();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedCategory = paymentCategories.find(cat => cat.name === paymentCategory);

        try {
            const response = await axios.put(`http://localhost:8000/api/payment-fee/update/${selectedStudent._id}`, {
                studentId: selectedStudent._id,
                status,
                amountPaid: status === 'Not Paid' ? 0 : parseFloat(amountPaid),
                paymentCategory,
                paymentDate: `${date}T${time}`,
                totalPrice: selectedCategory?.totalPrice || 0
            });

            if (response.data.success) {
                onSave({
                    status,
                    amountPaid: status === 'Not Paid' ? 0 : parseFloat(amountPaid),
                    paymentCategory,
                    date,
                    totalPrice: selectedCategory?.totalPrice || 0
                });
                onClose();
            } else {
                throw new Error(response.data.message || 'Failed to update payment');
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            alert(error.response?.data?.message || 'Failed to update payment');
        }
    };

    const resetForm = () => {
        setAmountPaid('');
        setStatus('Not Paid');
        setPaymentCategory('');
        setDate('');
        setTime('');
    };

    const totalPrice = paymentCategories.find(cat => cat.name === paymentCategory)?.totalPrice || 0;

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
                    <div style={modalStyles.row}>
                        <div style={modalStyles.paymentCategoryContainer}>
                            <label>Payment Category:</label>
                            <select
                                value={paymentCategory}
                                onChange={(e) => setPaymentCategory(e.target.value)}
                                style={modalStyles.select}
                            >
                                {paymentCategories.map(category => (
                                    <option key={category._id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={modalStyles.totalPriceContainer}>
                            <div style={modalStyles.totalPriceLabel}>
                                Total Price:
                            </div>
                            <div style={modalStyles.nonEditable}>
                                ₱{totalPrice.toFixed(2)}
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
                                required={status !== 'Not Paid'}
                                readOnly={status === 'Not Paid' || status === 'Refunded'}
                                style={{
                                    ...modalStyles.input,
                                    backgroundColor: status === 'Not Paid' || status === 'Refunded' ? '#cccccc' : 'white',
                                    color: status === 'Not Paid' || status === 'Refunded' ? '#666666' : 'black',
                                }}
                            />
                        </div>
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
        borderRadius: '1rem',
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