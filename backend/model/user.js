const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    auth0Id: { type: String, required: true, unique: true },
    name: String,
    email: String, 
    points: { type: Number, default: 0 }, 
    skills: [String],
    communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
