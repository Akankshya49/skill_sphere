const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, error: message },
    standardHeaders: true,
    legacyHeaders: false
  });
};

const rateLimits = {
  // General API rate limit: 100 requests per 15 minutes
  general: createRateLimit(15 * 60 * 1000, 100, 'Too many requests, please try again later'),
  
  // Create operations: 10 per 15 minutes
  create: createRateLimit(15 * 60 * 1000, 10, 'Too many create operations, please slow down'),
  
  // Review creation: 5 per hour (prevent spam)
  review: createRateLimit(60 * 60 * 1000, 5, 'Too many reviews, please wait before reviewing again'),
  
  // Search operations: 50 per 15 minutes
  search: createRateLimit(15 * 60 * 1000, 50, 'Too many search requests')
};

module.exports = rateLimits;