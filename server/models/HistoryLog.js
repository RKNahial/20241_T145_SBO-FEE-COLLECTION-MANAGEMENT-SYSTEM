const mongoose = require('mongoose');

const historyLogSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userPosition: { type: String, required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, default: 'completed' },
    metadata: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('HistoryLog', historyLogSchema); 