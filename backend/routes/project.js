const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const projectController = require('../controllers/projectController');
const { ensureUserExists } = require('../middleware/auth');
const { validateInput, validationRules } = require('../middleware/validation');
const rateLimits = require('../middleware/Rate limiting');

// Public routes
router.get('/', rateLimits.general, projectController.getProjects);
router.get('/:projectId', rateLimits.general, projectController.getProjectById);

// Protected routes
router.post('/', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.create,
  validateInput(validationRules.createProject),
  projectController.createproject
);

router.post('/:projectId/join', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  projectController.joinproject
);

router.put('/:projectId/status', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  projectController.updateProjectStatus
);

module.exports = router;