const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({ 
    title: { type: String, required: true },
    description: String,
    techStack: [String], 
    skillsRequired: [String], 
    collaborators: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: String,
        joinedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ["active", "inactive"], default: "active" }
    }],
    maxCollaborators: { type: Number, default: 5 },
    status: {
        type: String, 
        enum: ["Open", "In Progress", "Completed", "Paused", "Cancelled"],
        default: "Open"
    },
    githubRepo: String,
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true }, // Added missing field
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);