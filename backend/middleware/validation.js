const validateInput = (validationRules) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(validationRules)) {
      const value = req.body[field];

      // Required check
      if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip other validations if field is not provided and not required
      if (!value) continue;

      // Type check
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }

      // String length check
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters long`);
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must not exceed ${rules.maxLength} characters`);
      }

      // Array validation
      if (rules.isArray && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }

      // Custom validation
      if (rules.custom && !rules.custom(value)) {
        errors.push(rules.customError || `${field} is invalid`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: errors 
      });
    }

    next();
  };
};

// Common validation rules
const validationRules = {
  createCommunity: {
    name: { required: true, type: 'string', minLength: 3, maxLength: 50 },
    description: { required: true, type: 'string', minLength: 10, maxLength: 500 },
    tags: { isArray: true },
    isPublic: { type: 'boolean' }
  },

  createProject: {
    title: { required: true, type: 'string', minLength: 5, maxLength: 100 },
    description: { required: true, type: 'string', minLength: 20, maxLength: 1000 },
    techStack: { required: true, isArray: true },
    skillsRequired: { required: true, isArray: true },
    maxCollaborators: { 
      type: 'number', 
      custom: (value) => value >= 2 && value <= 20,
      customError: 'maxCollaborators must be between 2 and 20'
    },
    communityId: { required: true, type: 'string' }
  },

  createMeeting: {
    title: { required: true, type: 'string', minLength: 5, maxLength: 100 },
    scheduledAt: { 
      required: true, 
      type: 'string',
      custom: (value) => {
        const date = new Date(value);
        return date > new Date();
      },
      customError: 'Meeting must be scheduled for a future date'
    },
    communityId: { required: true, type: 'string' }
  },

  createReview: {
    revieweeId: { required: true, type: 'string' },
    points: { 
      required: true, 
      type: 'number',
      custom: (value) => value >= 1 && value <= 5,
      customError: 'Points must be between 1 and 5'
    },
    comment: { required: true, type: 'string', minLength: 10, maxLength: 500 }
  },

  updateProfile: {
    name: { type: 'string', minLength: 2, maxLength: 50 },
    skills: { isArray: true }
  }
};

module.exports = {
  validateInput,
  validationRules
};