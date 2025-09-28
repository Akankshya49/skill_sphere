const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({ 
    title: { type: String, required: true },
    agenda: String,
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    scheduledAt: { type: Date, required: true }, 
    meetingLink: String,
    createdAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ["Scheduled", "Live", "Completed", "Cancelled"],
        default: "Scheduled"
    }
});

module.exports = mongoose.model('Meeting', meetingSchema);