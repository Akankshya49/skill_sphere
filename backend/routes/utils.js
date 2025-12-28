const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const utilController = require('../controllers/utilController');
const { ensureUserExists } = require('../middleware/auth');
const rateLimits = require('../middleware/Rate limiting');

// Public routes
router.get('/search', rateLimits.search, utilController.globalSearch);
router.get('/stats', rateLimits.general, utilController.getPlatformStats);
router.get('/trending-projects', rateLimits.general, utilController.getTrendingProjects);

// Protected routes
router.get('/skill-matching-projects', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  utilController.findSkillMatchingProjects
);

router.get('/recommendations', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  utilController.getUserRecommendations
);

module.exports = router;