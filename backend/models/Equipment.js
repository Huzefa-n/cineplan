const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    // Cost used as the "weight" in the 0/1 Knapsack algorithm.
    cost: {
      type: Number,
      required: [true, 'Cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    // Production value used as the "value" in the 0/1 Knapsack algorithm.
    productionValue: {
      type: Number,
      required: [true, 'Production value is required'],
      min: [0, 'Production value cannot be negative'],
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Quantity cannot be negative'],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', EquipmentSchema);
