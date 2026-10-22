const mongoose = require('mongoose');

// Each connection represents a weighted edge in the location graph
// used by Dijkstra's algorithm.
const ConnectionSchema = new mongoose.Schema(
  {
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [0.1, 'Distance must be positive'],
    },
    // Optional metadata — does NOT affect Dijkstra's algorithm.
    travelTime: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const LocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Weighted adjacency list used by Dijkstra.
    connections: {
      type: [ConnectionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', LocationSchema);
