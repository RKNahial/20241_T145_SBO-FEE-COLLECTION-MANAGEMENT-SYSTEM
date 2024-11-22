const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    {
        timeout: 60000
    }
);

// Temporary OTP storage (In production, use Redis or a database)
const otpStorage = new Map();

exports.sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        
        otpStorage.set(phoneNumber, {
            code: otpCode,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });
        
        const twiml = `<Response><Say>Your verification code is: ${otpCode.toString().split('').join(', ')}</Say></Response>`;
        
        const call = await client.calls.create({
            twiml: twiml,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        res.status(200).json({
            success: true,
            message: 'Call initiated successfully',
            callSid: call.sid
        });
    } catch (error) {
        console.error('Error making call:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to make call',
            error: error.message
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otpCode } = req.body;
        
        const storedOTP = otpStorage.get(phoneNumber);
        
        if (!storedOTP) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found for this number',
                valid: false
            });
        }

        if (Date.now() > storedOTP.expiresAt) {
            otpStorage.delete(phoneNumber);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired',
                valid: false
            });
        }

        if (storedOTP.code.toString() === otpCode.toString()) {
            // Clear the OTP after successful verification
            otpStorage.delete(phoneNumber);
            
            res.status(200).json({
                success: true,
                message: 'OTP verified successfully',
                valid: true
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP',
                valid: false
            });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
}; 