const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const Workout = require('../models/Workout');

/**
 * @route   POST /api/workouts
 * @desc    Create a new workout
 * @access  Private
 */
router.post(
  '/',
  protect,
  [
    body('type').notEmpty().withMessage('Workout type is required'),
    body('duration')
      .isInt({ min: 1 })
      .withMessage('Duration must be at least 1 minute'),
    body('caloriesBurned')
      .isFloat({ min: 0 })
      .withMessage('Calories burned must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, duration, caloriesBurned, date } = req.body;

    try {
      const workout = await Workout.create({
        user: req.user._id,
        type,
        duration,
        caloriesBurned,
        date: date || Date.now(),
      });

      res.status(201).json(workout);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/workouts/:date?
 * @desc    Get workouts (all or filtered by date)
 * @access  Private
 */
router.get('/:date?', protect, async (req, res) => {
  try {
    let query = { user: req.user._id };

    // If date parameter provided, filter by that date
    if (req.params.date) {
      const startOfDay = new Date(req.params.date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(req.params.date);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    const workouts = await Workout.find(query).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
