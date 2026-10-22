const express = require('express');
const router = express.Router();
const {
  getAllScenes,
  getSceneById,
  createScene,
  updateScene,
  deleteScene,
} = require('../controllers/sceneController');

router.get('/',       getAllScenes);
router.get('/:id',    getSceneById);
router.post('/',      createScene);
router.put('/:id',    updateScene);
router.delete('/:id', deleteScene);

module.exports = router;
