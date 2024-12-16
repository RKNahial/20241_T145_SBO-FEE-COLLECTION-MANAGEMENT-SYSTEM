import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';

const VerifyOTP = ({ phoneNumber, onVerificationComplete, onResendRequest, onClose }) => {
    const [otpCode, setOtpCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [resendCooldown, setResendCooldown] = useState(30);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleVerifyOTP = async () => {
        try {
            setVerifying(true);
            const response = await axios.post('http://localhost:8000/api/verify-otp', {
                phoneNumber: phoneNumber,
                otpCode: otpCode
            });

            if (response.data.valid) {
                setMessage('OTP verified successfully');
                setMessageType('success');
                // Wait for a moment to show success message
                setTimeout(() => {
                    onVerificationComplete();
                    onClose(); // Close the modal
                }, 1500);
            } else {
                setMessage(response.data.message);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setMessage(error.response?.data?.message || 'Failed to verify OTP');
            setMessageType('error');
        } finally {
            setVerifying(false);
        }
    };

    const handleOTPChange = (index, value) => {
        if (value.length > 1) value = value[0];
        
        const newOtp = otpCode.split('');
        newOtp[index] = value;
        setOtpCode(newOtp.join(''));

        if (value && index < 5) {
            const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleResend = () => {
        if (resendCooldown === 0) {
            onResendRequest();
            setResendCooldown(30);
        }
    };

    return (
        <div>
            {message && (
                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} mb-3`}>
                    {message}
                </div>
            )}
            <div className="mb-3">
                <label className="form-label">Enter OTP</label>
                <div className="d-flex justify-content-between gap-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                            key={index}
                            type="text"
                            name={`otp-${index}`}
                            className="form-control text-center"
                            maxLength="1"
                            value={otpCode[index] || ''}
                            onChange={(e) => handleOTPChange(index, e.target.value)}
                            style={{ width: '3rem' }}
                        />
                    ))}
                </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
            <div className="ml-auto"> {/* Add a div to contain the buttons for alignment */}
                <Button
                    variant="btn update-"
                    onClick={handleVerifyOTP}
                    disabled={verifying || otpCode.length !== 6}
                    style={{
                        display: 'inline-block', 
                        color: '#EAEAEA',
                        marginRight: '10px', 
                        padding: '0.5rem 1rem', 
                        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                        backgroundColor: '#FF8C00',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#E67E22'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#FF8C00'}
                >
                    <FontAwesomeIcon icon={faKey} className="me-2" />
                    {verifying ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                    variant="outline-primary"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    style={{
                        display: 'inline-block', // Make the button take only the width of its content
                        padding: '0.5rem 1rem', // Adjust padding as needed
                    }}
                >
                    {resendCooldown > 0 
                        ? `Resend in ${resendCooldown}s` 
                        : 'Resend OTP'}
                </Button>
            </div>
        </div>
    </div>
    );
};

export default VerifyOTP;
