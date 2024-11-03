// controllers/officerController.js
const officerService = require('../services/OfficerGoogleCheck');

exports.checkOfficerGoogleAccount = async (req, res) => {
    const { email } = req.body;

    try {
        const officer = await officerService.findOfficerByEmail(email);
        if (officer) {
            return res.status(200).json({ success: true, message: "Officer account verified." });
        } else {
            return res.status(404).json({ success: false, message: "Officer account not found." });
        }
    } catch (error) {
        console.error("Error checking officer account:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};
