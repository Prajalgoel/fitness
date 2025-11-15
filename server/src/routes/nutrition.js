const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getNutritionInfo, calculateCaloriesBurned } = require('../services/nutritionService');

/**
 * @route   POST /api/nutrition/search
 * @desc    Search for food nutrition information
 * @access  Private
 */
router.post('/search', protect, async (req, res) => {
  try {
    const { foodName, quantity } = req.body;

    if (!foodName) {
      return res.status(400).json({ message: 'Food name is required' });
    }

    const qty = quantity || 100; // Default to 100g
    const nutrition = await getNutritionInfo(foodName, qty);

    if (!nutrition) {
      return res.status(404).json({ 
        message: 'Nutrition information not found. Please enter manually.',
        suggestion: 'Try a more common food name or enter the nutrition values yourself.'
      });
    }

    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/nutrition/calculate-workout
 * @desc    Calculate calories burned for a workout
 * @access  Private
 */
router.post('/calculate-workout', protect, async (req, res) => {
  try {
    const { workoutType, duration } = req.body;

    if (!workoutType || !duration) {
      return res.status(400).json({ message: 'Workout type and duration are required' });
    }

    const userWeight = req.user.weight || 70; // Use user's weight from profile
    const caloriesBurned = calculateCaloriesBurned(workoutType, duration, userWeight);

    res.json({
      workoutType,
      duration,
      caloriesBurned,
      userWeight,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
