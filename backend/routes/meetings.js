const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const { meetingController } = require('../controllers');
const { 
  ensureUserExists, 
  validateInput, 
  validationRules, 
  rateLimits 
} = require('../middleware');

// Protected routes (meetings are community-specific)
router.get('/community/:communityId', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  meetingController.getMeetings
);

router.get('/:meetingId', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  meetingController.getMeetingById
);

router.post('/', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.create,
  validateInput(validationRules.createMeeting),
  meetingController.createMeeting
);

router.put('/:meetingId/status', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  meetingController.updateMeetingStatus
);

module.exports = router;