import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
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
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowConfirmation(true);
    };

    const confirmUpdate = async () => {
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
                setShowConfirmation(false);
                onClose();
            } else {
                setError(response.data.message || 'Failed to update payment');
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            setError(error.response?.data?.message || 'Failed to update payment');
        }
    };
    const totalPrice = paymentCategories.find(cat => cat.name === paymentCategory)?.totalPrice || 0;

    return (
        <>
            <Modal 
                show={isOpen && !showConfirmation} 
                onHide={onClose}
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
                            onChange={(e) => setStatus(e.target.value)} 
                            className="form-select"
                            style={modalStyles.select}
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
                            style={modalStyles.input}
                        />
                    </div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div style={{ flex: '1', marginRight: '1rem' }}>
                            <label className="mb-2">Payment Category:</label>
                            <select
                                value={paymentCategory}
                                onChange={(e) => setPaymentCategory(e.target.value)}
                                className="form-select"
                                style={modalStyles.select}
                            >
                                {paymentCategories.map(category => (
                                    <option key={category._id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ minWidth: '120px' }}>
                            <label className="mb-2">Total Price:</label>
                            <div style={modalStyles.nonEditable}>
                                ₱{totalPrice.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="mb-2">Amount Paid:</label>
                        <input
                            type="number"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            required={status !== 'Not Paid'}
                            readOnly={status === 'Not Paid' || status === 'Refunded'}
                            className="form-control"
                            style={{
                                ...modalStyles.input,
                                backgroundColor: status === 'Not Paid' || status === 'Refunded' ? '#cccccc' : 'white',
                                color: status === 'Not Paid' || status === 'Refunded' ? '#666666' : 'black',
                            }}
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer style={{ border: 'none', padding: '0 1.25rem 1.25rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{ 
                            ...modalStyles.buttonStyles, 
                            backgroundColor: hoverSave ? '#E67E22' : '#FF8C00'
                        }}
                        onMouseEnter={() => setHoverSave(true)}
                        onMouseLeave={() => setHoverSave(false)}
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ 
                            ...modalStyles.buttonStyles, 
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

         {/* Confirmation */}
         <Modal
            show={showConfirmation}
            onHide={() => setShowConfirmation(false)}
            style={{ ...modalStyles.modalTop, zIndex: 1070 }}
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
                <strong>Payment Category:</strong> {paymentCategory}
            </div>
             <div className="mb-2">
                 <strong>New Status:</strong> {status}
             </div>
             <div className="mb-2">
                 <strong>Amount Paid:</strong> ₱{amountPaid || '0.00'}
             </div>
         </Modal.Body>
         <Modal.Footer>
             <button
                 type="button"
                 onClick={confirmUpdate}
                 style={{ 
                     ...modalStyles.buttonStyles, 
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
                     ...modalStyles.buttonStyles, 
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