const mongoose = require('mongoose');
const Review = require('../model/review');
const User = require('../model/user');

const reviewController = {
  // Create a review
  createReview: async (req, res) => {
    try {
      const auth0Id = req.oidc.user.sub;
      const { revieweeId, points, comment } = req.body;

      const reviewer = await User.findOne({ auth0Id });
      if (!reviewer) {
        return res.status(404).json({ success: false, error: 'Reviewer not found' });
      }

      const reviewee = await User.findById(revieweeId);
      if (!reviewee) {
        return res.status(404).json({ success: false, error: 'User to review not found' });
      }

      // Prevent self-review
      if (reviewer._id.toString() === reviewee._id.toString()) {
        return res.status(400).json({ success: false, error: 'Cannot review yourself' });
      }

      // Check if reviewer has already reviewed this user
      const existingReview = await Review.findOne({
        reviewer: reviewer._id,
        reviewee: reviewee._id
      });

      if (existingReview) {
        return res.status(400).json({ success: false, error: 'You have already reviewed this user' });
      }

      const review = new Review({
        reviewer: reviewer._id,
        reviewee: reviewee._id,
        points: Math.max(1, Math.min(5, points)), // Ensure points are between 1-5
        comment
      });

      await review.save();

      // Update reviewee's points
      reviewee.points += points;
      await reviewee.save();

      res.status(201).json({ success: true, review });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get reviews for a user
  getUserReviews: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const reviews = await Review.find({ reviewee: userId })
        .populate('reviewer', 'name')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Review.countDocuments({ reviewee: userId });

      // Calculate average rating
      const avgRating = await Review.aggregate([
        { $match: { reviewee: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, avgRating: { $avg: '$points' } } }
      ]);

      res.json({
        success: true,
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total
        },
        averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 0
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get reviews given by a user
  getReviewsByUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const reviews = await Review.find({ reviewer: userId })
        .populate('reviewee', 'name')
        .sort({ createdAt: -1 })
        .exec();

      res.json({ success: true, reviews });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = reviewController;