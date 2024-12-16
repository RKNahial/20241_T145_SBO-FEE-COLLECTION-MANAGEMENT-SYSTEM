const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken, {
    timeout: 60000
});

// Store OTPs temporarily (in production, use a database)
const otpStore = new Map();

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via voice call
exports.sendOTP = async (req, res) => {
    try {
        let { phoneNumber } = req.body;
        
        // Format phone number to E.164 format
        if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+1' + phoneNumber.replace(/\D/g, '');
        }

        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with expiration (5 minutes)
        otpStore.set(phoneNumber, {
            code: otp,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });
        
        // Create TwiML for voice call
        const twimlResponse = `
            <Response>
                <Say>Your verification code is: ${otp.split('').join(', ')}. I repeat, your code is: ${otp.split('').join(', ')}.</Say>
                <Pause length="1"/>
                <Say>Goodbye!</Say>
            </Response>
        `;

        // Make voice call using Twilio
        const call = await client.calls.create({
            twiml: twimlResponse,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        res.status(200).json({
            success: true,
            message: 'OTP call initiated successfully',
            callId: call.sid
        });
    } catch (error) {
        console.error('Error initiating OTP call:', {
            error: error.message,
            code: error.code,
            moreInfo: error.moreInfo,
            status: error.status,
            details: error.details
        });
        res.status(500).json({
            success: false,
            message: 'Failed to initiate OTP call',
            error: error.message
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otpCode } = req.body;

        // Get stored OTP data
        const storedOTPData = otpStore.get(phoneNumber);
        
        if (!storedOTPData) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found for this phone number. Please request a new OTP.',
                valid: false
            });
        }

        // Check if OTP has expired
        if (Date.now() > storedOTPData.expiresAt) {
            otpStore.delete(phoneNumber); // Clean up expired OTP
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
                valid: false
            });
        }

        // Verify OTP
        const isValid = storedOTPData.code === otpCode;
        
        if (isValid) {
            // Clean up used OTP
            otpStore.delete(phoneNumber);
        }

        res.status(200).json({
            success: true,
            message: isValid ? 'OTP verified successfully' : 'Invalid OTP code',
            valid: isValid
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
};