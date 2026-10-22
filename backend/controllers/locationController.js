const Location = require('../models/Location');

// GET /api/locations
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find().populate('connections.to', 'name');
    res.json({ success: true, data: locations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/locations/:id
const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id).populate('connections.to', 'name');
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, data: location });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/locations
const createLocation = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Location name is required.' });

    const location = await Location.create(req.body);
    res.status(201).json({ success: true, data: location });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/locations/:id
const updateLocation = async (req, res) => {
  try {
    // Validate connections if provided
    if (Array.isArray(req.body.connections)) {
      for (const conn of req.body.connections) {
        if (!conn.to) return res.status(400).json({ success: false, message: 'Each connection must have a target location (to).' });
        if (!conn.distance || conn.distance <= 0)
          return res.status(400).json({ success: false, message: 'Each connection must have a positive distance.' });
      }
    }

    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('connections.to', 'name');

    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
    res.json({ success: true, data: location });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/locations/:id
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    // Remove this location from other locations' connections.
    await Location.updateMany(
      { 'connections.to': req.params.id },
      { $pull: { connections: { to: req.params.id } } }
    );

    res.json({ success: true, message: 'Location deleted and connections cleaned up.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/locations/:id/connections
// Add a connection from this location to another.
const addConnection = async (req, res) => {
  try {
    const { to, distance, travelTime } = req.body;
    if (!to) return res.status(400).json({ success: false, message: 'Target location (to) is required.' });
    if (!distance || distance <= 0)
      return res.status(400).json({ success: false, message: 'Distance must be positive.' });

    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ success: false, message: 'Location not found' });

    const toLocation = await Location.findById(to);
    if (!toLocation) return res.status(404).json({ success: false, message: 'Target location not found' });

    // Avoid duplicate connections
    const existing = location.connections.find(c => c.to.toString() === to);
    if (existing) {
      existing.distance = distance;
      if (travelTime !== undefined) existing.travelTime = travelTime;
    } else {
      location.connections.push({ to, distance, travelTime });
    }

    await location.save();

    // Make undirected: add reverse connection if not present
    const revExists = toLocation.connections.find(c => c.to.toString() === req.params.id);
    if (!revExists) {
      toLocation.connections.push({ to: req.params.id, distance, travelTime });
      await toLocation.save();
    }

    const updated = await Location.findById(req.params.id).populate('connections.to', 'name');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  addConnection,
};
