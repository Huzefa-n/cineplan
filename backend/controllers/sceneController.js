const Scene = require('../models/Scene');

// GET /api/scenes
const getAllScenes = async (req, res) => {
  try {
    const scenes = await Scene.find().populate('project', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: scenes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/scenes/:id
const getSceneById = async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id).populate('project', 'name');
    if (!scene) return res.status(404).json({ success: false, message: 'Scene not found' });
    res.json({ success: true, data: scene });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/scenes
const createScene = async (req, res) => {
  try {
    const { name, deadline, priority } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Scene name is required.' });
    if (!deadline || deadline < 1)
      return res.status(400).json({ success: false, message: 'Deadline must be at least 1.' });
    if (!priority || priority < 1)
      return res.status(400).json({ success: false, message: 'Priority must be at least 1.' });

    const scene = await Scene.create(req.body);
    res.status(201).json({ success: true, data: scene });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/scenes/:id
const updateScene = async (req, res) => {
  try {
    const scene = await Scene.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!scene) return res.status(404).json({ success: false, message: 'Scene not found' });
    res.json({ success: true, data: scene });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/scenes/:id
const deleteScene = async (req, res) => {
  try {
    const scene = await Scene.findByIdAndDelete(req.params.id);
    if (!scene) return res.status(404).json({ success: false, message: 'Scene not found' });
    res.json({ success: true, message: 'Scene deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllScenes, getSceneById, createScene, updateScene, deleteScene };
