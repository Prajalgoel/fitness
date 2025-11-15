const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const FoodLog = require('../src/models/FoodLog');
const Workout = require('../src/models/Workout');

// Test database connection
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/fitness-test';
  await mongoose.connect(mongoUri);
});

// Clean up after tests
afterAll(async () => {
  await User.deleteMany({});
  await FoodLog.deleteMany({});
  await Workout.deleteMany({});
  await mongoose.connection.close();
});

// Clear data before each test
beforeEach(async () => {
  await User.deleteMany({});
  await FoodLog.deleteMany({});
  await Workout.deleteMany({});
});

describe('API Tests', () => {
  let authToken;
  let userId;

  /**
   * Test 1: Health check returns 200
   */
  test('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });

  /**
   * Test 2: Signup and login flow
   */
  test('POST /api/auth/signup should create user and return token', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      age: 25,
      weight: 70,
      height: 170,
      goal: 'loss',
    };

    const res = await request(app)
      .post('/api/auth/signup')
      .send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe(userData.email);
    expect(res.body.name).toBe(userData.name);
    expect(res.body).not.toHaveProperty('password');

    authToken = res.body.token;
    userId = res.body._id;
  });

  test('POST /api/auth/login should return token for valid credentials', async () => {
    // First create a user
    await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      age: 25,
      weight: 70,
      height: 170,
      goal: 'loss',
    });

    // Then try to login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('test@example.com');
  });

  /**
   * Test 3: Unauthorized access returns 401
   */
  test('GET /api/summary/today should return 401 without token', async () => {
    const res = await request(app).get('/api/summary/today');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  /**
   * Test 4: Create food log and verify saved
   */
  test('POST /api/food should create food log when authenticated', async () => {
    // Create user and get token
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      age: 25,
      weight: 70,
      height: 170,
      goal: 'loss',
    });

    const token = signupRes.body.token;

    // Create food log
    const foodData = {
      name: 'Apple',
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      servings: 1,
    };

    const res = await request(app)
      .post('/api/food')
      .set('Authorization', `Bearer ${token}`)
      .send(foodData);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(foodData.name);
    expect(res.body.calories).toBe(foodData.calories);
    expect(res.body).toHaveProperty('user');
  });

  /**
   * Test 5: GET /api/summary/today returns correct structure
   */
  test('GET /api/summary/today should return correct consumed/burned/net structure', async () => {
    // Create user and get token
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      age: 25,
      weight: 70,
      height: 170,
      goal: 'loss',
    });

    const token = signupRes.body.token;

    // Create a food log
    await request(app)
      .post('/api/food')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Banana',
        calories: 100,
        protein: 1,
        carbs: 27,
        fat: 0.3,
        servings: 1,
      });

    // Create a workout
    await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'Running',
        duration: 30,
        caloriesBurned: 250,
      });

    // Get summary
    const res = await request(app)
      .get('/api/summary/today')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('consumed');
    expect(res.body).toHaveProperty('burned');
    expect(res.body).toHaveProperty('net');
    expect(res.body).toHaveProperty('advice');
    expect(res.body).toHaveProperty('foodCount');
    expect(res.body).toHaveProperty('workoutCount');
    expect(res.body.consumed).toBe(100);
    expect(res.body.burned).toBe(250);
    expect(res.body.net).toBe(-150);
    expect(res.body.foodCount).toBe(1);
    expect(res.body.workoutCount).toBe(1);
    expect(Array.isArray(res.body.advice)).toBe(true);
  });
});
