const express = require('express');
const {
  checkRecommendation,
  createRecommendation,
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/check/:doctorId', checkRecommendation);
router.post('/', createRecommendation);

module.exports = router;