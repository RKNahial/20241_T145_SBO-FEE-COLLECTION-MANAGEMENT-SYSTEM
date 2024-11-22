import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faKey } from '@fortawesome/free-solid-svg-icons';

const OTPVerificationModal = ({
    show,
    onClose,
    onVerificationComplete,
    phoneNumber,
    setPhoneNumber,
    otpSent,
    setOtpSent,
    otpCode,
    setOtpCode,
    loading,
    setLoading,
    verifying,
    setVerifying,
    setOtpVerified,
    setMessage
}) => {
    const [modalMessage, setModalMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleSendOTP = async () => {
        try {
            setLoading(true);
            let formattedPhoneNumber = phoneNumber;
            if (!phoneNumber.startsWith('+')) {
                formattedPhoneNumber = phoneNumber.startsWith('1')
                    ? `+${phoneNumber}`
                    : `+1${phoneNumber.replace(/^1/, '')}`;
            }

            const response = await axios.post('http://localhost:8000/api/send-otp', {
                phoneNumber: formattedPhoneNumber
            });

            if (response.data.success) {
                setOtpSent(true);
                setModalMessage('OTP call initiated. You will receive a call shortly.');
                setMessageType('success');
            }
        } catch (error) {
            console.error('Error sending OTP:', error.response?.data || error);
            setModalMessage(error.response?.data?.message || 'Failed to send OTP. Please check your phone number.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            setVerifying(true);
            const response = await axios.post('http://localhost:8000/api/verify-otp', {
                phoneNumber: phoneNumber,
                otpCode: otpCode
            });

            if (response.data.valid) {
                setOtpVerified(true);
                setMessage('OTP verified successfully. You can now login.');
                onVerificationComplete();
                onClose();
            } else {
                setMessage('Invalid OTP code');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setMessage(error.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>OTP Verification</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {modalMessage && (
                    <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
                        {modalMessage}
                    </div>
                )}
                {!otpSent ? (
                    <div className="form-group">
                        <label>Enter Phone Number</label>
                        <div className="input-group">
                            <input
                                type="tel"
                                className="form-control"
                                placeholder="+1XXXXXXXXXX"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        <Button
                            className="mt-3 w-100 d-flex align-items-center justify-content-center"
                            onClick={handleSendOTP}
                            disabled={loading || !phoneNumber}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                            {loading ? 'Sending...' : 'Send OTP'}
                        </Button>
                    </div>
                ) : (
                    <div className="form-group">
                        <label>Enter OTP Code</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter OTP"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                        />
                        <Button
                            className="mt-3 w-100 d-flex align-items-center justify-content-center"
                            onClick={handleVerifyOTP}
                            disabled={verifying || !otpCode}
                        >
                            <FontAwesomeIcon icon={faKey} className="me-2" />
                            {verifying ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                        <Button
                            variant="link"
                            className="mt-2 w-100"
                            onClick={() => {
                                setOtpSent(false);
                                setOtpCode('');
                            }}
                        >
                            Change Phone Number
                        </Button>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default OTPVerificationModal; 