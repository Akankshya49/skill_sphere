const express = require ('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const {reviewController} = require('../controllers');
const {
    ensureUserExists,
    validateInput,
    validationRules,
    rateLimits
}  = require('../middleware');

// public route 
router.get('/user/:userId',rateLimits.general , reviewController.getUserReviews);

// protected routes
router.post('/',
    requiresAuth(),
    ensureUserExists,
    rateLimits.create,
    validateInput(validationRules.createReview),
    reviewController.createReview
);

router.get('/by-user/:userId',
    requiresAuth(),
    ensureUserExists,
    rateLimits.general,
    reviewController.getReviewsByUser
);

module.exports = router;