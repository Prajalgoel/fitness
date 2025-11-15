require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const FoodLog = require('../models/FoodLog');
const Workout = require('../models/Workout');
const connectDB = require('../config/db');

/**
 * Seed script to populate database with demo data
 * Creates one demo user with sample food logs and workouts
 */
const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await FoodLog.deleteMany({});
    await Workout.deleteMany({});

    // Create demo user
    console.log('Creating demo user...');
    const user = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
      age: 30,
      weight: 75,
      height: 175,
      goal: 'loss',
    });

    console.log('Demo user created:', user.email);

    // Create sample food logs for today
    console.log('Creating sample food logs...');
    const today = new Date();
    
    const foodLogs = [
      {
        user: user._id,
        name: 'Oatmeal with Banana',
        calories: 350,
        protein: 12,
        carbs: 65,
        fat: 7,
        servings: 1,
        date: today,
      },
      {
        user: user._id,
        name: 'Grilled Chicken Salad',
        calories: 450,
        protein: 45,
        carbs: 30,
        fat: 15,
        servings: 1,
        date: today,
      },
      {
        user: user._id,
        name: 'Greek Yogurt',
        calories: 150,
        protein: 15,
        carbs: 12,
        fat: 5,
        servings: 1,
        date: today,
      },
      {
        user: user._id,
        name: 'Salmon with Vegetables',
        calories: 550,
        protein: 40,
        carbs: 35,
        fat: 25,
        servings: 1,
        date: today,
      },
    ];

    await FoodLog.insertMany(foodLogs);
    console.log(`${foodLogs.length} food logs created`);

    // Create sample workouts for today
    console.log('Creating sample workouts...');
    const workouts = [
      {
        user: user._id,
        type: 'Running',
        duration: 30,
        caloriesBurned: 300,
        date: today,
      },
      {
        user: user._id,
        type: 'Weight Training',
        duration: 45,
        caloriesBurned: 250,
        date: today,
      },
    ];

    await Workout.insertMany(workouts);
    console.log(`${workouts.length} workouts created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo account credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
