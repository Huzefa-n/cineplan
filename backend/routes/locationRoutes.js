const express = require('express');
const router = express.Router();
const {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  addConnection,
} = require('../controllers/locationController');

router.get('/',              getAllLocations);
router.get('/:id',           getLocationById);
router.post('/',             createLocation);
router.put('/:id',           updateLocation);
router.delete('/:id',        deleteLocation);
router.post('/:id/connections', addConnection);

module.exports = router;
