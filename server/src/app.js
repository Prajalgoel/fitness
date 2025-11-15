const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');
const foodRoutes = require('./routes/food');
const summaryRoutes = require('./routes/summary');
const healthRoutes = require('./routes/health');
const nutritionRoutes = require('./routes/nutrition');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: ['http://localhost:5173', 'https://fitness-delta-ivory.vercel.app'],
  credentials: true
})); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/nutrition', nutritionRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
