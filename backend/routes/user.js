const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureUserExists } = require('../middleware/auth');
const rateLimits = require('../middleware/Rate limiting');  
const {requireAuth} = require('express-openid-connect');

// public route
router.get('/leaderboard',rateLimits.general, userController.getLeaderboard);

// other routes
router.get('/profile',requireAuth(), ensureUserExists, userController.getProfile);

router.put('/profile',requireAuth(), ensureUserExists, rateLimits.create, validateInput(validationRules.updateProfile), userController.updateProfile);
router.get('/dashboard',requireAuth(), ensureUserExists,userController.getDashboard);

module.exports = router;

















