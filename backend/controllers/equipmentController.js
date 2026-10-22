const Equipment = require('../models/Equipment');

// GET /api/equipment
const getAllEquipment = async (req, res) => {
  try {
    const items = await Equipment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/equipment/:id
const getEquipmentById = async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/equipment
const createEquipment = async (req, res) => {
  try {
    const { name, cost, productionValue } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Equipment name is required.' });
    if (cost === undefined || cost < 0)
      return res.status(400).json({ success: false, message: 'Cost must be a non-negative number.' });
    if (productionValue === undefined || productionValue < 0)
      return res.status(400).json({ success: false, message: 'Production value must be a non-negative number.' });

    const item = await Equipment.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/equipment/:id
const updateEquipment = async (req, res) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/equipment/:id
const deleteEquipment = async (req, res) => {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Equipment not found' });
    res.json({ success: true, message: 'Equipment deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllEquipment, getEquipmentById, createEquipment, updateEquipment, deleteEquipment };
