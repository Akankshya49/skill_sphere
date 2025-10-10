const User = require('../model/user');
const Community = require('../model/community');
const Project = require('../model/project');
const Meeting = require('../model/meeting');

const utilController = {
  // AI-powered skill matching for projects
  findSkillMatchingProjects: async (req, res) => {
    try {
      const auth0Id = req.oidc.user.sub;
      
      const user = await User.findOne({ auth0Id });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (!user.skills || user.skills.length === 0) {
        return res.json({ 
          success: true, 
          projects: [], 
          message: 'Add skills to your profile to get personalized project recommendations' 
        });
      }

      // Find projects that match user's skills
      const matchingProjects = await Project.find({
        status: 'Open',
        skillsRequired: { $in: user.skills },
        'collaborators.user': { $ne: user._id } // Exclude projects user is already part of
      })
      .populate('postedBy', 'name')
      .populate('community', 'name')
      .limit(10)
      .sort({ createdAt: -1 })
      .exec();

      // Calculate match percentage for each project
      const projectsWithMatchScore = matchingProjects.map(project => {
        const matchingSkills = project.skillsRequired.filter(skill => 
          user.skills.includes(skill)
        );
        const matchPercentage = Math.round(
          (matchingSkills.length / project.skillsRequired.length) * 100
        );

        return {
          ...project.toObject(),
          matchPercentage,
          matchingSkills
        };
      });

      // Sort by match percentage
      projectsWithMatchScore.sort((a, b) => b.matchPercentage - a.matchPercentage);

      res.json({ 
        success: true, 
        projects: projectsWithMatchScore,
        userSkills: user.skills 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Global search across communities, projects, and users
  globalSearch: async (req, res) => {
    try {
      const { query, type = 'all' } = req.query;
      
      if (!query) {
        return res.status(400).json({ success: false, error: 'Search query is required' });
      }

      const searchResults = {};

      if (type === 'all' || type === 'communities') {
        searchResults.communities = await Community.find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ],
          isPublic: true
        })
        .populate('createdBy', 'name')
        .limit(5)
        .exec();
      }

      if (type === 'all' || type === 'projects') {
        searchResults.projects = await Project.find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { techStack: { $in: [new RegExp(query, 'i')] } }
          ]
        })
        .populate('postedBy', 'name')
        .populate('community', 'name')
        .limit(5)
        .exec();
      }

      if (type === 'all' || type === 'users') {
        searchResults.users = await User.find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { skills: { $in: [new RegExp(query, 'i')] } }
          ]
        })
        .select('name skills points')
        .limit(5)
        .exec();
      }

      res.json({ success: true, results: searchResults });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get platform statistics
  getPlatformStats: async (req, res) => {
    try {
      const [totalUsers, totalCommunities, totalProjects, activeMeetings] = await Promise.all([
        User.countDocuments(),
        Community.countDocuments({ isPublic: true }),
        Project.countDocuments(),
        Meeting.countDocuments({ 
          scheduledAt: { $gte: new Date() },
          status: { $in: ['Scheduled', 'Live'] }
        })
      ]);

      // Get top skills across platform
      const topSkills = await User.aggregate([
        { $unwind: '$skills' },
        { $group: { _id: '$skills', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Get most active communities
      const activeCommunities = await Community.find({ isPublic: true })
        .sort({ 'stats.totalMembers': -1 })
        .limit(5)
        .select('name stats.totalMembers stats.totalProjects')
        .exec();

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalCommunities,
          totalProjects,
          activeMeetings,
          topSkills: topSkills.map(skill => ({
            name: skill._id,
            count: skill.count
          })),
          activeCommunities
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get trending projects (based on recent activity)
  getTrendingProjects: async (req, res) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const trendingProjects = await Project.find({
        createdAt: { $gte: oneWeekAgo },
        status: { $in: ['Open', 'In Progress'] }
      })
      .populate('postedBy', 'name')
      .populate('community', 'name')
      .sort({ createdAt: -1 })
      .limit(8)
      .exec();

      res.json({ success: true, trendingProjects });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
module.exports = utilController;