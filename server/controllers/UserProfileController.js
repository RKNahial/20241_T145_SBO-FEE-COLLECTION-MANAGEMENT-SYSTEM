const AdminModel = require('../models/AdminSchema');
const GovernorModel = require('../models/GovernorSchema');
const TreasurerModel = require('../models/TreasurerSchema');
const OfficerModel = require('../models/OfficerSchema');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
    try {
        const { email, position } = req.params;
        let userModel;

        switch (position.toLowerCase()) {
            case 'treasurer':
                userModel = TreasurerModel;
                break;
            case 'governor':
                userModel = GovernorModel;
                break;
            case 'officer':
                userModel = OfficerModel;
                break;
            case 'admin':
                userModel = AdminModel;
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid position' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            profile: {
                name: user.name,
                ID: user.ID,
                email: user.email,
                position: position,
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Failed to load profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { email, position } = req.params;
        const { name, ID, password } = req.body;
        let userModel;

        switch (position.toLowerCase()) {
            case 'treasurer':
                userModel = TreasurerModel;
                break;
            case 'governor':
                userModel = GovernorModel;
                break;
            case 'officer':
                userModel = OfficerModel;
                break;
            case 'admin':
                userModel = AdminModel;
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid position' });
        }

        const updateData = { name, ID };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const updatedUser = await userModel.findOneAndUpdate(
            { email },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            profile: {
                name: updatedUser.name,
                ID: updatedUser.ID,
                email: updatedUser.email,
                position: position
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
}; 