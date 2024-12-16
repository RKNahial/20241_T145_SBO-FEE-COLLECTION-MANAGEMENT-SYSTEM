const Admin = require('../models/AdminSchema');
const Treasurer = require('../models/TreasurerSchema');
const Officer = require('../models/OfficerSchema');
const Governor = require('../models/GovernorSchema');

class OfficialService {
    async getAllOfficials() {
        const [officers, treasurers, governors] = await Promise.all([
            Officer.find().select('-password'),
            Treasurer.find().select('-password'),
            Governor.find().select('-password')
        ]);

        return [
            ...officers.map(officer => ({
                ...officer.toObject(),
                type: 'Officer',
                id: officer.ID || officer._id
            })),
            ...treasurers.map(treasurer => ({
                ...treasurer.toObject(),
                type: 'Treasurer',
                id: treasurer.ID || treasurer._id
            })),
            ...governors.map(governor => ({
                ...governor.toObject(),
                type: 'Governor',
                id: governor.ID || governor._id
            }))
        ];
    }

    getModelByType(type) {
        switch (type) {
            case 'Officer': return Officer;
            case 'Treasurer': return Treasurer;
            case 'Governor': return Governor;
            default: throw new Error('Invalid official type');
        }
    }

    async toggleArchiveStatus(id, type, isArchiving) {
        const Model = this.getModelByType(type);
        const updateData = {
            isArchived: isArchiving,
            archivedAt: isArchiving ? new Date() : null
        };

        const official = await Model.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!official) {
            throw new Error('Official not found');
        }

        return official;
    }

    async getOfficialById(id) {
        let official = await Officer.findById(id).select('-password');
        let type = 'Officer';

        if (!official) {
            official = await Treasurer.findById(id).select('-password');
            type = 'Treasurer';
        }

        if (!official) {
            official = await Governor.findById(id).select('-password');
            type = 'Governor';
        }

        if (!official) {
            throw new Error('Official not found');
        }

        return {
            ...official.toObject(),
            type,
            position: official.position || type
        };
    }

    async updateOfficial(id, updateData) {
        const { name, ID, email, position } = updateData;
        
        // First get the current official to determine their type
        const currentOfficial = await this.getOfficialById(id);
        if (!currentOfficial) {
            throw new Error('Official not found');
        }

        // If position has changed, we need to move the official to a different collection
        if (position && position !== currentOfficial.type) {
            // Get the new model based on the new position
            const NewModel = this.getModelByType(position);
            const OldModel = this.getModelByType(currentOfficial.type);

            // Check if email exists in the new collection
            const existingUser = await NewModel.findOne({ 
                email: email,
                _id: { $ne: id }
            });

            if (existingUser) {
                throw new Error('Email already exists');
            }

            // Get the old document
            const oldDoc = await OldModel.findById(id);
            if (!oldDoc) {
                throw new Error('Official not found in original collection');
            }

            // Create new document in the new collection
            const newDoc = new NewModel({
                _id: oldDoc._id,
                name: name || oldDoc.name,
                ID: ID || oldDoc.ID,
                email: email || oldDoc.email,
                password: oldDoc.password,
                position: position,
                isArchived: oldDoc.isArchived,
                archivedAt: oldDoc.archivedAt
            });

            // Save the new document and delete the old one
            await newDoc.save();
            await OldModel.findByIdAndDelete(id);

            return newDoc;
        } else {
            // If position hasn't changed, just update the existing document
            const Model = this.getModelByType(currentOfficial.type);

            const existingUser = await Model.findOne({ 
                email: email,
                _id: { $ne: id }
            });

            if (existingUser) {
                throw new Error('Email already exists');
            }

            const updatedOfficial = await Model.findByIdAndUpdate(
                id,
                {
                    name: name || undefined,
                    ID: ID || undefined,
                    email: email || undefined,
                    position: position || undefined
                },
                { new: true }
            );

            if (!updatedOfficial) {
                throw new Error('Failed to update official');
            }

            return updatedOfficial;
        }
    }
}

module.exports = new OfficialService(); 