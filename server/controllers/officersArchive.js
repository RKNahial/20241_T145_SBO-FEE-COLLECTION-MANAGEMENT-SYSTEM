const Officer = require('../models/OfficerSchema');
const ArchivedOfficer = require('../models/OfficerArchive');

// Function to archive an officer
async function archiveOfficer(officerId, reason) {
    try {
        // Find the officer in the active collection
        const officer = await Officer.findOne({ studentID: officerId });
        if (!officer) return { error: "Officer not found" };

        // Create a new archived officer document
        const archivedOfficer = new ArchivedOfficer({
            ...officer.toObject(),  // Copy officer details
            archived_date: new Date(),
            archived_reason: reason,
        });

        // Save the archived officer and remove from active collection
        await archivedOfficer.save();
        await Officer.deleteOne({ studentID: officerId });

        return { message: "Officer archived successfully" };
    } catch (error) {
        console.error("Error archiving officer:", error);
        return { error: "Failed to archive officer" };
    }
}

// Export the function
module.exports = {
    archiveOfficer,
};
