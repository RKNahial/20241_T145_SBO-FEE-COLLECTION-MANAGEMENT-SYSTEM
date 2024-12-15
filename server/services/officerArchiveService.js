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

    async unarchiveOfficer(officerId) {
        try {
            // Find the officer in the archived collection
            const archivedOfficer = await ArchivedOfficer.findOne({ studentID: officerId });
            if (!archivedOfficer) {
                throw new Error('Archived officer not found');
            }

            // Create a new active officer document
            // Remove archive-specific fields from the object
            const { archived_date, archived_reason, _id, __v, ...officerData } = archivedOfficer.toObject();
            
            const officer = new Officer(officerData);

            // Save the officer to active collection and remove from archived collection
            await Promise.all([
                officer.save(),
                ArchivedOfficer.deleteOne({ studentID: officerId })
            ]);

            return {
                success: true,
                message: 'Officer unarchived successfully',
                data: officer
            };
        } catch (error) {
            console.error('Error unarchiving officer:', error);
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