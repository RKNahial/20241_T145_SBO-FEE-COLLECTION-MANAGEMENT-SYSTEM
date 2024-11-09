const mongoose = require('mongoose');

// Create a separate schema for counter
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 1000 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Main Payment Category Schema
const paymentCategorySchema = new mongoose.Schema({
    Payment_categoryID: { type: String, required: true, unique: true },
    Totalprice: { type: String, required: true, unique: true },
    status: { type: String, default: 'notArchive' },
}, { timestamps: true });

// Pre-save middleware to auto-increment Payment_categoryID
paymentCategorySchema.pre('save', async function(next) {
    try {
        if (this.isNew) {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'paymentCategoryId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.Payment_categoryID = counter.seq.toString();
        }
        next();
    } catch (error) {
        next(error);
    }
});

const PaymentCategory = mongoose.model('PaymentCategory', paymentCategorySchema);

module.exports = PaymentCategory;