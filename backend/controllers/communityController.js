const CommunityPost = require('../models/CommunityPost');

// @desc    Get community posts
// @route   GET /api/community
// @access  Private
const getCommunityPosts = async (req, res) => {
  try {
    const { q = '', type = '', country = '', sort = 'newest' } = req.query;
    const query = {};

    if (type) query.type = type;
    if (country) query.country = country;
    if (q.trim()) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { title: regex },
        { content: regex },
        { country: regex },
        { region: regex },
        { relatedName: regex },
        { authorName: regex },
      ];
    }

    const sortOption = sort === 'rating' ? { rating: -1, createdAt: -1 } : { createdAt: -1 };
    const posts = await CommunityPost.find(query).sort(sortOption);
    const allPosts = await CommunityPost.find({}, 'country type');

    res.status(200).json({
      posts,
      countries: [...new Set(allPosts.map((post) => post.country).filter(Boolean))],
      types: [...new Set(allPosts.map((post) => post.type).filter(Boolean))],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create community post
// @route   POST /api/community
// @access  Private
const createCommunityPost = async (req, res) => {
  try {
    const { title, content, type, country, region, relatedName, rating } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and experience are required' });
    }

    const post = await CommunityPost.create({
      userId: req.user.id,
      authorName: `${req.user.firstName} ${req.user.lastName}`.trim(),
      authorPhoto: req.user.profilePhoto,
      title,
      content,
      type,
      country,
      region,
      relatedName,
      rating,
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommunityPosts,
  createCommunityPost,
};
