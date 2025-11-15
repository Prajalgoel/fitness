const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const FoodLog = require('../models/FoodLog');
const Workout = require('../models/Workout');

/**
 * Generate personalized advice based on user goal and net calories
 */
const generateAdvice = (goal, netCalories, consumed, burned) => {
  const advice = [];

  if (goal === 'loss') {
    if (netCalories > 0) {
      advice.push('Great job! You have a calorie deficit today.');
    }
    if (netCalories < -500) {
      advice.push('Your deficit is very high. Consider eating a bit more to maintain energy.');
    }
    if (burned < 200) {
      advice.push('Try to increase your physical activity to boost calorie burn.');
    }
    if (consumed > 2500) {
      advice.push('Consider reducing portion sizes to stay within your calorie goals.');
    }
  } else if (goal === 'gain') {
    if (netCalories < -300) {
      advice.push('Good! You have a calorie surplus to support muscle gain.');
    }
    if (netCalories > 0) {
      advice.push('Try to consume more calories to support your weight gain goals.');
    }
    advice.push('Ensure you are getting enough protein for muscle building.');
  } else if (goal === 'maintain') {
    if (Math.abs(netCalories) < 200) {
      advice.push('Perfect! Your calories are well-balanced for maintenance.');
    }
    if (netCalories > 300) {
      advice.push('You have a slight deficit. Consider eating a bit more.');
    }
    if (netCalories < -300) {
      advice.push('You have a slight surplus. Consider reducing intake slightly.');
    }
  }

  if (advice.length === 0) {
    advice.push('Keep up the good work! Stay consistent with your tracking.');
  }

  return advice;
};

/**
 * @route   GET /api/summary/today
 * @desc    Get today's summary with consumed, burned, net calories and advice
 * @access  Private
 */
router.get('/today', protect, async (req, res) => {
  try {
    // Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's food logs
    const foodLogs = await FoodLog.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Get today's workouts
    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Calculate totals
    const consumed = foodLogs.reduce(
      (total, log) => total + log.calories * log.servings,
      0
    );

    const burned = workouts.reduce(
      (total, workout) => total + workout.caloriesBurned,
      0
    );

    const netCalories = consumed - burned;

    // Generate personalized advice
    const advice = generateAdvice(
      req.user.goal,
      netCalories,
      consumed,
      burned
    );

    res.json({
      consumed: Math.round(consumed),
      burned: Math.round(burned),
      net: Math.round(netCalories),
      goal: req.user.goal,
      foodCount: foodLogs.length,
      workoutCount: workouts.length,
      advice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
