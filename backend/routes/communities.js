const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const { communityController } = require('../controllers');
const { 
  ensureUserExists, 
  validateInput, 
  validationRules, 
  rateLimits, 
} = require('../middleware');

// Public routes
router.get('/', rateLimits.general, communityController.getCommunities);
router.get('/:communityId', rateLimits.general, communityController.getCommunityById);

// Protected routes
router.post('/', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.create,
  validateInput(validationRules.createCommunity),
  communityController.createCommunity
);

router.post('/:communityId/join', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  communityController.joinCommunity
);

router.delete('/:communityId/leave', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  communityController.leaveCommunity
);

module.exports = router;