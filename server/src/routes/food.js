const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const FoodLog = require('../models/FoodLog');

/**
 * @route   POST /api/food
 * @desc    Create a new food log entry
 * @access  Private
 */
router.post(
  '/',
  protect,
  [
    body('name').notEmpty().withMessage('Food name is required'),
    body('calories')
      .isFloat({ min: 0 })
      .withMessage('Calories must be a positive number'),
    body('protein')
      .isFloat({ min: 0 })
      .withMessage('Protein must be a positive number'),
    body('carbs')
      .isFloat({ min: 0 })
      .withMessage('Carbs must be a positive number'),
    body('fat')
      .isFloat({ min: 0 })
      .withMessage('Fat must be a positive number'),
    body('servings')
      .optional()
      .isFloat({ min: 0.1 })
      .withMessage('Servings must be at least 0.1'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, calories, protein, carbs, fat, servings, date } = req.body;

    try {
      const foodLog = await FoodLog.create({
        user: req.user._id,
        name,
        calories,
        protein,
        carbs,
        fat,
        servings: servings || 1,
        date: date || Date.now(),
      });

      res.status(201).json(foodLog);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   GET /api/food/:date?
 * @desc    Get food logs (all or filtered by date)
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

    const foodLogs = await FoodLog.find(query).sort({ date: -1 });
    res.json(foodLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
