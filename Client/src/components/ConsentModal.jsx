import React from 'react';
import '../assets/css/consentModal.css';

const ConsentModal = ({ isOpen, onClose, onAccept, onDecline }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="consent-modal">
                <h3>Stay Logged In</h3>
                <p>Would you like to stay logged in for 24 hours?</p>
                <p className="consent-details">
                    By accepting, you'll remain logged in for 24 hours on this device.
                    If you decline, your session will last for 1 hour.
                </p>
                <div className="consent-buttons">
                    <button className="btn btn-secondary" onClick={onDecline}>
                        1 Hour Session
                    </button>
                    <button className="btn btn-primary" onClick={onAccept}>
                        Stay Logged In (24 Hours)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsentModal;