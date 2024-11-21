const Officer = require('../models/OfficerSchema');
const ArchivedOfficer = require('../models/OfficerArchive');

class OfficerArchiveService {
    async archiveOfficer(officerId, reason) {
        try {
            // Find the officer in the active collection
            const officer = await Officer.findOne({ studentID: officerId });
            if (!officer) {
                throw new Error('Officer not found');
            }

            // Create a new archived officer document
            const archivedOfficer = new ArchivedOfficer({
                ...officer.toObject(),
                archived_date: new Date(),
                archived_reason: reason
            });

            // Save the archived officer and remove from active collection
            await Promise.all([
                archivedOfficer.save(),
                Officer.deleteOne({ studentID: officerId })
            ]);

            return {
                success: true,
                message: 'Officer archived successfully',
                data: archivedOfficer
            };
        } catch (error) {
            console.error('Error archiving officer:', error);
            throw error;
        }
    }

    async getArchivedOfficers() {
        try {
            const archivedOfficers = await ArchivedOfficer.find()
                .sort({ archived_date: -1 });
            return {
                success: true,
                data: archivedOfficers
            };
        } catch (error) {
            console.error('Error fetching archived officers:', error);
            throw error;
        }
    }
}

module.exports = new OfficerArchiveService(); 