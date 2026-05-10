const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorPhoto: {
      type: String,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please share your experience'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Trip', 'Activity'],
      default: 'Trip',
    },
    country: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    relatedName: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CommunityPost', communityPostSchema);
