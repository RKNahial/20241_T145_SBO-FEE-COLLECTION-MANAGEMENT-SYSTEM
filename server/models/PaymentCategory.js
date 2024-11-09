// models/PaymentCategory.js
const mongoose = require('mongoose');

const paymentCategorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const PaymentCategory = mongoose.model('PaymentCategory', paymentCategorySchema);
module.exports = PaymentCategory;