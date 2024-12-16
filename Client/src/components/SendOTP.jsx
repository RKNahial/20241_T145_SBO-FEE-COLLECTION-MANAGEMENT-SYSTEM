import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const SendOTP = ({ phoneNumber, setPhoneNumber, onOTPSent, loading, setLoading }) => {
    const [message, setMessage] = useState('');
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
                setMessage('OTP call initiated. You will receive a call shortly.');
                setMessageType('success');
                onOTPSent();
            }
        } catch (error) {
            console.error('Error sending OTP:', error.response?.data || error);
            setMessage(error.response?.data?.message || 'Failed to send OTP. Please check your phone number.');
            setMessageType('error');
        } finally {
            setLoading(false);
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
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <div className="input-group">
                    <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={loading}
                        placeholder="+1XXXXXXXXXX"
                    />
                    <Button 
                        variant="primary" 
                        onClick={handleSendOTP}
                        disabled={loading || !phoneNumber}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                        {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SendOTP;
