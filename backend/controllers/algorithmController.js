const { knapsack }       = require('../algorithms/knapsack/knapsack');
const { jobSequencing }  = require('../algorithms/jobScheduling/jobSequencing');
const { dijkstra }       = require('../algorithms/dijkstra/dijkstra');
const Equipment          = require('../models/Equipment');
const Scene              = require('../models/Scene');
const Location           = require('../models/Location');

// ─────────────────────────────────────────────────────────────
// POST /api/algorithms/knapsack
// Body: { budget: number, items?: [{name, cost, productionValue}] }
//       If items is omitted, fetches all available equipment
//       from the database.
// ─────────────────────────────────────────────────────────────
const runKnapsack = async (req, res) => {
  try {
    const { budget, items } = req.body;

    if (budget === undefined || budget === null)
      return res.status(400).json({ success: false, message: 'Budget is required.' });
    if (isNaN(budget) || budget < 0)
      return res.status(400).json({ success: false, message: 'Budget must be a non-negative number.' });

    let equipment = items;

    // If the caller did not provide items, load from DB.
    if (!Array.isArray(equipment) || equipment.length === 0) {
      equipment = await Equipment.find({ availability: true });
    }

    if (!equipment || equipment.length === 0)
      return res.status(400).json({ success: false, message: 'No equipment items found. Please add equipment first.' });

    const startTime = Date.now();
    const result = knapsack(Number(budget), equipment);
    const executionTime = Date.now() - startTime;

    res.json({ success: true, data: { ...result, executionTime } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/algorithms/job-scheduling
// Body: { jobs?: [{name, deadline, priority, ...}] }
//       If jobs is omitted, fetches all scenes from DB.
// ─────────────────────────────────────────────────────────────
const runJobScheduling = async (req, res) => {
  try {
    let { jobs } = req.body;

    if (!Array.isArray(jobs) || jobs.length === 0) {
      jobs = await Scene.find({ status: { $in: ['pending', 'scheduled'] } });
    }

    if (!jobs || jobs.length === 0)
      return res.status(400).json({ success: false, message: 'No scenes/jobs found. Please add scenes first.' });

    const startTime = Date.now();
    const result = jobSequencing(jobs);
    const executionTime = Date.now() - startTime;

    res.json({ success: true, data: { ...result, executionTime } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/algorithms/dijkstra
// Body: { sourceId: string, destId: string, locations?: [...] }
//       If locations is omitted, fetches all locations from DB.
// ─────────────────────────────────────────────────────────────
const runDijkstra = async (req, res) => {
  try {
    const { sourceId, destId } = req.body;

    if (!sourceId || !destId)
      return res.status(400).json({ success: false, message: 'sourceId and destId are required.' });

    // Always load locations fresh from DB to get populated connections.
    const locations = await Location.find();

    if (!locations || locations.length === 0)
      return res.status(400).json({ success: false, message: 'No locations found. Please add locations first.' });

    const startTime = Date.now();
    const result = dijkstra(locations, sourceId, destId);
    const executionTime = Date.now() - startTime;

    if (result.error)
      return res.status(400).json({ success: false, message: result.error });

    res.json({ success: true, data: { ...result, executionTime } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { runKnapsack, runJobScheduling, runDijkstra };
