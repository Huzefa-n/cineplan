const mongoose = require('mongoose');

const SceneSchema = new mongoose.Schema(
  {
    sceneId: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Scene name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    actors: {
      type: [String],
      default: [],
    },
    // Deadline: the time slot by which this scene must be scheduled (positive integer).
    deadline: {
      type: Number,
      required: [true, 'Deadline is required'],
      min: [1, 'Deadline must be at least 1'],
    },
    // Priority / profit used by the Job Sequencing algorithm.
    priority: {
      type: Number,
      required: [true, 'Priority is required'],
      min: [1, 'Priority must be at least 1'],
    },
    // Duration in hours — stored as metadata only, does NOT affect the algorithm.
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
      default: 'pending',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scene', SceneSchema);
