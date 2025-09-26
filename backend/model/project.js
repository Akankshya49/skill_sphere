const mongoose = require('mongoose');
const projectschema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }


})
module.exports = mongoose.model('Project',projectschema);