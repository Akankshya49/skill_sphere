const mongoose = require ('mongoose');
const meetingschema = new mongoose.schema ({
    title: { type: String, required: true },
    agenda: String,
    scheduleby: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    time:{ type: Date, required: true },
    meetlink: String,
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Meeting',meetingschema);