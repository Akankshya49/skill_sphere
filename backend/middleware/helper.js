const mongoose = require('mongoose');

const helpers = {
  // Check if string is valid MongoDB ObjectId
  isValidObjectId: (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  },

  // Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input === 'string') {
      return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
    }
    return input;
  },

  // Calculate pagination
  getPagination: (page, limit) => {
    const currentPage = Math.max(1, parseInt(page) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(limit) || 10)); // Max 50 items per page
    const skip = (currentPage - 1) * perPage;
    
    return { currentPage, perPage, skip };
  },

  // Format API response
  formatResponse: (success, data, message, pagination = null) => {
    const response = { success };
    
    if (data !== undefined) {
      response.data = data;
    }
    
    if (message) {
      response.message = message;
    }
    
    if (pagination) {
      response.pagination = pagination;
    }
    
    return response;
  },

  // Calculate skill match percentage
  calculateSkillMatch: (userSkills, requiredSkills) => {
    if (!userSkills || !requiredSkills || requiredSkills.length === 0) {
      return 0;
    }
    
    const matchingSkills = requiredSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    
    return Math.round((matchingSkills.length / requiredSkills.length) * 100);
  },

  // Generate unique meeting room names
  generateMeetingRoom: () => {
    const adjectives = ['Creative', 'Innovative', 'Dynamic', 'Collaborative', 'Focused'];
    const nouns = ['Developers', 'Builders', 'Creators', 'Innovators', 'Team'];
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    
    return `${adj}-${noun}-${number}`;
  }
};

module.exports = helpers;