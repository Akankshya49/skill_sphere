const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const { projectController } = require('../controllers');
const { 
  ensureUserExists, 
  validateInput, 
  validationRules, 
  rateLimits 
} = require('../middleware');

// Public routes
router.get('/', rateLimits.general, projectController.getProjects);
router.get('/:projectId', rateLimits.general, projectController.getProjectById);

// Protected routes
router.post('/', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.create,
  validateInput(validationRules.createProject),
  projectController.createProject
);

router.post('/:projectId/join', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  projectController.joinProject
);

router.put('/:projectId/status', 
  requiresAuth(), 
  ensureUserExists,
  rateLimits.general,
  projectController.updateProjectStatus
);

module.exports = router;