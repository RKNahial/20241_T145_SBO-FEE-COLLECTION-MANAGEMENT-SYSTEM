const nodemailer = require('nodemailer');
const { google } = require('googleapis');
require('dotenv').config();

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

exports.sendPaymentDetails = async (req, res) => {
    try {
        const { studentEmail, paymentDetails, studentName } = req.body;

        // Get new access token
        const accessToken = await oauth2Client.getAccessToken();

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken.token
            }
        });

        const mailOptions = {
            from: `"BUKSU Payment System" <${process.env.EMAIL_USER}>`,
            to: studentEmail,
            subject: 'Payment Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Payment Details for ${studentName}</h2>
                    <p><strong>Payment Category:</strong> ${paymentDetails.paymentCategory}</p>
                    <p><strong>Amount Paid:</strong> ₱${paymentDetails.amountPaid}</p>
                    <p><strong>Status:</strong> ${paymentDetails.status}</p>
                    <p><strong>Date:</strong> ${new Date(paymentDetails.paymentDate).toLocaleDateString()}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
}; 