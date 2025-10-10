const User = require('../models/user');

// Middleware to ensure user exists in database
const ensureUserExists = async (req, res, next) => {
  try {
    if (!req.oidc || !req.oidc.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const auth0Id = req.oidc.user.sub;
    let user = await User.findOne({ auth0Id });

    if (!user) {
      // Auto-create user if doesn't exist
      user = new User({
        auth0Id,
        name: req.oidc.user.name || 'Anonymous User',
        email: req.oidc.user.email || ''
      });
      await user.save();
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: 'Authentication error' });
  }
};

// Middleware to check if user is community admin/moderator
const checkCommunityRole = (requiredRole = 'member') => {
  return async (req, res, next) => {
    try {
      const { communityId } = req.params;
      const userId = req.user._id;

      const Community = require('../models/community');
      const community = await Community.findById(communityId);

      if (!community) {
        return res.status(404).json({ success: false, error: 'Community not found' });
      }

      const member = community.members.find(
        m => m.user.toString() === userId.toString()
      );

      if (!member) {
        return res.status(403).json({ success: false, error: 'Not a community member' });
      }

      // Check role hierarchy: admin > moderator > member
      const roleHierarchy = { admin: 3, moderator: 2, member: 1 };
      const userRole = roleHierarchy[member.role] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

      if (userRole < requiredRoleLevel) {
        return res.status(403).json({ 
          success: false, 
          error: `${requiredRole} role required` 
        });
      }

      req.userRole = member.role;
      next();
    } catch (error) {
      res.status(500).json({ success: false, error: 'Role check failed' });
    }
  };
};
module.exports = {
  ensureUserExists,
  checkCommunityRole
};