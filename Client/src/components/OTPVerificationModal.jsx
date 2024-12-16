import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import SendOTP from './SendOTP';
import VerifyOTP from './VerifyOTP';
import '../assets/css/OTPVerificationModal.css';

const OTPVerificationModal = ({
    show,
    onClose,
    onVerificationComplete,
    phoneNumber,
    setPhoneNumber
}) => {
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);

    const handleOTPSent = () => {
        setOtpSent(true);
    };

    const handleResendRequest = () => {
        setOtpSent(false);
    };

    const handleVerificationComplete = () => {
        onVerificationComplete();
        // Modal will be closed by VerifyOTP component after showing success message
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>OTP Verification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {!otpSent ? (
                    <SendOTP
                        phoneNumber={phoneNumber}
                        setPhoneNumber={setPhoneNumber}
                        onOTPSent={handleOTPSent}
                        loading={loading}
                        setLoading={setLoading}
                    />
                ) : (
                    <VerifyOTP
                        phoneNumber={phoneNumber}
                        onVerificationComplete={handleVerificationComplete}
                        onResendRequest={handleResendRequest}
                        onClose={onClose}
                    />
                )}
            </Modal.Body>
        </Modal>
    );
};

export default OTPVerificationModal;