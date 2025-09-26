const mongoose = require('mongoose');
const reviewschema = new mongoose.Schema({
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    points: { type: Number, default: 1 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
    
});

module.exports = mongoose.model('Review',reviewschema);