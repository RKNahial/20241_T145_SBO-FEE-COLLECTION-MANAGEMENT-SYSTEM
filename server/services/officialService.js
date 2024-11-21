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
                type: 'Officer'
            })),
            ...treasurers.map(treasurer => ({
                ...treasurer.toObject(),
                type: 'Treasurer'
            })),
            ...governors.map(governor => ({
                ...governor.toObject(),
                type: 'Governor'
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
        const { name, ID, email, position, type } = updateData;
        const Model = this.getModelByType(type);

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
                name, 
                ID, 
                email, 
                position,
                updatedAt: new Date()
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).select('-password');

        if (!updatedOfficial) {
            throw new Error('Official not found');
        }

        return { ...updatedOfficial.toObject(), type };
    }
}

module.exports = new OfficialService(); 