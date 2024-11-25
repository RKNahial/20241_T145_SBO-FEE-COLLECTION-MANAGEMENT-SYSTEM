const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    position: { type: String, required: true },
    permissions: {
        addStudent: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        addPaymentCategory: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        updateStudent: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        updatePaymentCategory: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        archiveStudent: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        unarchiveStudent: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        toggleDuesPayment: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        duesPayment: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        paymentUpdate: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        archiveCategory: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        unarchiveCategory: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' },
        emailNotifications: { type: String, enum: ['view', 'edit', 'denied'], default: 'denied' }
    }
});

module.exports = mongoose.model('RolePermission', rolePermissionSchema); 