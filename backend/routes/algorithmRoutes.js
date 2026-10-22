const express = require('express');
const router = express.Router();
const { runKnapsack, runJobScheduling, runDijkstra } = require('../controllers/algorithmController');

router.post('/knapsack',       runKnapsack);
router.post('/job-scheduling', runJobScheduling);
router.post('/dijkstra',       runDijkstra);

module.exports = router;
