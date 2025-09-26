const mongoose = require('mongoose');

const communityscehma = new mongoose.schema({
    name: { type: String, required: true, unique: true },
    description: String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Community',communityscehma);
