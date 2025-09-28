const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({ 
    name: { type: String, required: true, unique: true },
    description: String,
    members: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now }
    }],
    avatar: String,
    tags: [String],
    rules: [String],
    stats: {
        totalMembers: { type: Number, default: 0 },
        totalProjects: { type: Number, default: 0 }
    },
    isPublic: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    settings: {
        allowProjectCreation: { type: Boolean, default: true },
        requireApproval: { type: Boolean, default: false },
        chatEnabled: { type: Boolean, default: true }
    }
});

module.exports = mongoose.model('Community', communitySchema);
