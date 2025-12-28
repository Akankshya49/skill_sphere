const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureUserExists } = require('../middleware/auth');
const { validateInput, validationRules } = require('../middleware/validation');
const rateLimits = require('../middleware/Rate limiting');  
const {requiresAuth} = require('express-openid-connect');

// public route
router.get('/leaderboard',rateLimits.general, userController.getLeaderboard);

// other routes
router.get('/profile',requiresAuth(), ensureUserExists, userController.getProfile);

router.put('/profile',requiresAuth(), ensureUserExists, rateLimits.create, validateInput(validationRules.updateProfile), userController.updateProfile);
router.get('/dashboard',requiresAuth(), ensureUserExists,userController.getDashboard);

module.exports = router;

















