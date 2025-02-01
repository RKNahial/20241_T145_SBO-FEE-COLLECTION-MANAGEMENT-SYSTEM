import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import '../styles/LockModal.css';

const ManageFeeModal = ({ isOpen, onClose, onSave, studentName, selectedStudent, initialPaymentCategory }) => {
    const [paymentCategories, setPaymentCategories] = useState([]);
    const [amountPaid, setAmountPaid] = useState('');
    const [status, setStatus] = useState('Not Paid');
    const [paymentCategory, setPaymentCategory] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [hoverSave, setHoverSave] = useState(false);
    const [hoverCancel, setHoverCancel] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState('');
    const [showLockModal, setShowLockModal] = useState(false);
    const [lockMessage, setLockMessage] = useState('');
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        const fetchPaymentCategories = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/payment-categories');
                const activeCategories = response.data.categories.filter(category => !category.isArchived);
                setPaymentCategories(activeCategories);
                
                // Set payment category based on initialPaymentCategory or first available category
                if (initialPaymentCategory) {
                    const category = activeCategories.find(cat => cat._id === initialPaymentCategory);
                    if (category) {
                        setPaymentCategory(category._id);
                    }
                } else if (activeCategories.length > 0) {
                    setPaymentCategory(activeCategories[0]._id);
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
            checkEditLock();
        }

        return () => {
            if (isLocked) {
                releaseLock();
            }
        };
    }, [isOpen, initialPaymentCategory]);

    const checkEditLock = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8000/api/payment-fee/${selectedStudent._id}/check-lock/Edit`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            
            if (!response.data.success) {
                setLockMessage(`This payment is currently being edited by ${response.data.userName}`);
                setShowLockModal(true);
                setIsLocked(true);
                onClose();
            } else {
                // If no lock exists, acquire one
                await acquireLock();
            }
        } catch (error) {
            console.error('Error checking lock:', error);
            setError('Unable to check lock status. Please try again later.');
        }
    };

    const acquireLock = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8000/api/payment-fee/${selectedStudent._id}/acquire-lock/Edit`,
                { lockType: 'Edit' },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (!response.data.success) {
                setLockMessage(response.data.message);
                setShowLockModal(true);
                setIsLocked(true);
                onClose();
            } else {
                setIsLocked(true);
            }
        } catch (error) {
            console.error('Error acquiring lock:', error);
            setError('Unable to acquire lock. Please try again later.');
        }
    };

    const releaseLock = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:8000/api/payment-fee/${selectedStudent._id}/release-lock/Edit`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setIsLocked(false);
        } catch (error) {
            console.error('Error releasing lock:', error);
        }
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        
        switch (newStatus) {
            case 'Fully Paid':
                setAmountPaid(totalPrice.toString());
                break;
            case 'Not Paid':
                setAmountPaid('0');
                break;
            case 'Refunded':
                setAmountPaid('');
                break;
            case 'Partially Paid':
                setAmountPaid(''); 
                break;
            default:
                setAmountPaid('');
        }
    };

    const handleAmountPaidChange = (e) => {
        const value = parseFloat(e.target.value);
        
        // Allow empty string for initial typing
        if (e.target.value === '') {
            setAmountPaid('');
            return;
        }

        // Prevent negative numbers and zero
        if (value <= 0) {
            return;
        }

        // For refunded status, don't allow amount greater than total price
        if (status === 'Refunded' && value > totalPrice) {
            return;
        }

        setAmountPaid(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const confirmUpdate = async () => {
        const selectedCategory = paymentCategories.find(cat => cat._id === paymentCategory);
        const token = localStorage.getItem('token');
    
        try {
            const response = await axios.put(
                `http://localhost:8000/api/payment-fee/update/${selectedStudent._id}`,
                {
                    studentId: selectedStudent._id,
                    status,
                    amountPaid: status === 'Not Paid' ? 0 : parseFloat(amountPaid),
                    paymentCategory,
                    paymentDate: `${date}T${time}`,
                    totalPrice: selectedCategory?.totalPrice || 0
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (response.data.success) {
                onSave({
                    status,
                    amountPaid: status === 'Not Paid' ? 0 : parseFloat(amountPaid),
                    paymentCategory,
                    date,
                    totalPrice: selectedCategory?.totalPrice || 0
                });
                setShowConfirmation(false);
                await releaseLock();
                onClose();
            } else {
                setError(response.data.message || 'Failed to update payment');
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            setError(error.response?.data?.message || 'Failed to update payment');
        }
    };

    const totalPrice = paymentCategories.find(cat => cat._id === paymentCategory)?.totalPrice || 0;

    const handleClose = async () => {
        if (isLocked) {
            await releaseLock();
        }
        onClose();
    };

    return (
        <>
            <Modal
                show={showLockModal}
                onHide={() => setShowLockModal(false)}
                centered
                className="lock-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Payment Being Edited</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{lockMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowLockModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={isOpen && !showConfirmation && !showLockModal}
                onHide={handleClose}
                centered
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton style={{ border: 'none', paddingBottom: 0 }}>
                    <Modal.Title style={{ display: 'flex', alignItems: 'center' }}>
                        <i className="fa-solid fa-pen me-2"></i>
                        Update Payment
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '1.25rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <span style={{ fontWeight: 'bold' }}>Student:</span> {studentName}
                        </div>
                        <div className="mb-3">
                            <label className="mb-2">Status:</label>
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                className="form-select"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    marginBottom: '0',
                                    borderRadius: '0.25rem',
                                    border: '1px solid #ccc',
                                }}
                            >
                                <option value="Not Paid">Not Paid</option>
                                <option value="Partially Paid">Partially Paid</option>
                                <option value="Fully Paid">Fully Paid</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="mb-2">Date:</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="form-control"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    marginBottom: '0',
                                    borderRadius: '0.25rem',
                                    border: '1px solid #ccc',
                                }}
                            />
                        </div>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div style={{ flex: '1', marginRight: '1rem' }}>
                                <label className="mb-2">Payment Category:</label>
                                <select
                                    value={paymentCategory}
                                    onChange={(e) => setPaymentCategory(e.target.value)}
                                    className="form-select"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        marginBottom: '0',
                                        borderRadius: '0.25rem',
                                        border: '1px solid #ccc',
                                    }}
                                >
                                    {paymentCategories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ minWidth: '120px' }}>
                                <label className="mb-2">Total Price:</label>
                                <div style={{
                                    background: '#f0f0f0',
                                    padding: '0.5rem',
                                    borderRadius: '0.25rem',
                                    textAlign: 'left',
                                    minWidth: '5.50rem',
                                }}>
                                    ₱{totalPrice.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="mb-2">
                                {status === 'Refunded' ? 'Amount Refunded:' : 'Amount Paid:'}
                            </label>
                            <input
                                type="number"
                                value={amountPaid}
                                onChange={handleAmountPaidChange}
                                required={status !== 'Not Paid'}
                                readOnly={status === 'Not Paid'}
                                className="form-control"
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    marginBottom: '0',
                                    borderRadius: '0.25rem',
                                    border: '1px solid #ccc',
                                    backgroundColor: status === 'Not Paid' ? '#cccccc' : 'white',
                                    color: status === 'Not Paid' ? '#666666' : 'black',
                                }}
                                min="0.01"
                                max={status === 'Refunded' ? totalPrice : undefined}
                                step="0.01"
                            />
                            {status === 'Refunded' && (
                                <small className="text-muted">
                                    Enter the amount to be refunded (max: ₱{totalPrice})
                                </small>
                            )}
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer style={{ border: 'none', padding: '0 1.25rem 1.25rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            style={{
                                borderRadius: '0.35rem',
                                color: '#EAEAEA',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                backgroundColor: hoverSave ? '#E67E22' : '#FF8C00'
                            }}
                            onMouseEnter={() => setHoverSave(true)}
                            onMouseLeave={() => setHoverSave(false)}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            style={{
                                borderRadius: '0.35rem',
                                color: '#EAEAEA',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                                backgroundColor: hoverCancel ? '#cc0000' : 'red'
                            }}
                            onMouseEnter={() => setHoverCancel(true)}
                            onMouseLeave={() => setHoverCancel(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showConfirmation}
                onHide={() => setShowConfirmation(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="fas fa-exclamation-circle me-2"></i>
                        Confirm Update
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to save these changes?</p>
                    <div className="mb-2">
                        <strong>Student:</strong> {studentName}
                    </div>
                    <div className="mb-2">
                        <strong>Payment Category:</strong> {paymentCategories.find(cat => cat._id === paymentCategory)?.name}
                    </div>
                    <div className="mb-2">
                        <strong>New Status:</strong> {status}
                    </div>
                    <div className="mb-2">
                        <strong>
                            {status === 'Refunded' ? 'Amount Refunded:' : 'Amount Paid:'}
                        </strong> ₱{amountPaid || '0.00'}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        onClick={confirmUpdate}
                        style={{
                            borderRadius: '0.35rem',
                            color: '#EAEAEA',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                            backgroundColor: hoverSave ? '#E67E22' : '#FF8C00'
                        }}
                        onMouseEnter={() => setHoverSave(true)}
                        onMouseLeave={() => setHoverSave(false)}
                    >
                        Confirm
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowConfirmation(false)}
                        style={{
                            borderRadius: '0.35rem',
                            color: '#EAEAEA',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                            backgroundColor: hoverCancel ? '#cc0000' : 'red'
                        }}
                        onMouseEnter={() => setHoverCancel(true)}
                        onMouseLeave={() => setHoverCancel(false)}
                    >
                        Cancel
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

const modalStyles = {
    modalTop: {
        top: '0%',
        transform: 'translateY(0)',
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
        marginBottom: '0',
        borderRadius: '0.25rem',
        border: '1px solid #ccc',
    },
    select: {
        width: '100%',
        padding: '0.5rem',
        marginBottom: '0',
        borderRadius: '0.25rem',
        border: '1px solid #ccc',
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