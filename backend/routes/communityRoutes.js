const express = require('express');
const router = express.Router();
const {
  createCommunityPost,
  getCommunityPosts,
} = require('../controllers/communityController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getCommunityPosts)
  .post(createCommunityPost);

module.exports = router;
