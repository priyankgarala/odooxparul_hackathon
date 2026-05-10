const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  description: { type: String },
  dateRange: { type: String },
  budget: { type: String }
});

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a title for the trip'],
      trim: true,
    },
    description: {
      type: String,
    },
    startDate: {
      type: Date,
      required: [true, 'Please add a start date'],
    },
    endDate: {
      type: Date,
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    sections: [sectionSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to generate a shareId if the trip is made public and doesn't have one
tripSchema.pre('save', function () {
  if (this.isPublic && !this.shareId) {
    // Generate a simple random alphanumeric string
    this.shareId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }
});

module.exports = mongoose.model('Trip', tripSchema);
