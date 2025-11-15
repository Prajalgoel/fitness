# Fitness & Nutrition Tracker (MERN Stack)

A full-stack web application for tracking fitness workouts and nutrition intake with personalized health advice based on user goals.

## Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Workout Tracking**: Log workouts with type, duration, and calories burned
- **Food Logging**: Track meals with detailed macronutrients (calories, protein, carbs, fat)
- **Daily Summary**: View consumed calories, burned calories, net calories, and personalized advice
- **Health Advice Engine**: Get recommendations based on your fitness goals (weight loss, gain, or maintenance)
- **RESTful API**: Clean API architecture with proper validation and error handling
- **Responsive UI**: React-based frontend with intuitive navigation

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing
- express-validator for input validation
- Jest & Supertest for testing

### Frontend
- React 18 with Vite
- React Router for navigation
- Axios for API requests
- React Testing Library for component tests

## Project Structure

```
fitness-nutrition-mern/
├── server/                 # Backend API
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # Mongoose models
│   │   ├── middleware/    # Auth & error handling
│   │   ├── routes/        # API routes
│   │   ├── scripts/       # Seed data script
│   │   ├── tests/         # Jest tests
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Server entry point
│   ├── package.json
│   └── .env.example
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   ├── App.jsx        # Root component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── .env.example
├── misc/
│   └── postman_collection.json
├── .gitignore
└── README.md
```

## Environment Variables

### Server (.env)
```
PORT=5000
MONGO_URI=<your_mongo_connection_string>
JWT_SECRET=<your_jwt_secret>
TOKEN_EXPIRES_IN=7d
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Local Development Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB instance
- Git

### 1. Clone the repository
```bash
git clone <repository-url>
cd fitness-nutrition-mern
```

### 2. Setup Server
```bash
cd server
npm install
```

Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Setup Client
```bash
cd ../client
npm install
```

Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env if needed (default: http://localhost:5000/api)
```

### 4. Run the Application

**Terminal 1 - Start Server:**
```bash
cd server
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Start Client:**
```bash
cd client
npm run dev
```
Client runs on http://localhost:5173

### 5. Seed Demo Data (Optional)
```bash
cd server
npm run seed
```
This creates a demo user:
- Email: demo@example.com
- Password: password123

## Running Tests

### Server Tests
```bash
cd server
npm test
```

Tests cover:
- Health check endpoint
- User signup and login flow
- Authentication middleware
- Food logging
- Daily summary calculations

### Client Tests
```bash
cd client
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token

### Workouts
- `POST /api/workouts` - Log a workout (protected)
- `GET /api/workouts` - Get all workouts (protected)
- `GET /api/workouts/:date` - Get workouts for specific date (protected)

### Food Logs
- `POST /api/food` - Log a meal (protected)
- `GET /api/food` - Get all food logs (protected)
- `GET /api/food/:date` - Get food logs for specific date (protected)

### Summary
- `GET /api/summary/today` - Get today's summary with advice (protected)

### Health
- `GET /api/health` - Server health check (public)

## Example API Requests

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "age": 30,
    "weight": 75,
    "height": 175,
    "goal": "loss"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Log Food (requires token)
```bash
curl -X POST http://localhost:5000/api/food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Chicken Breast",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6,
    "servings": 1
  }'
```

### Log Workout (requires token)
```bash
curl -X POST http://localhost:5000/api/workouts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "type": "Running",
    "duration": 30,
    "caloriesBurned": 300
  }'
```

### Get Daily Summary (requires token)
```bash
curl -X GET http://localhost:5000/api/summary/today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment to Render

### Step 1: Setup MongoDB
1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for Render access
5. Get your connection string (MONGO_URI)

### Step 2: Deploy Backend
1. Go to https://render.com and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: fitness-tracker-api
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string (e.g., use `openssl rand -base64 32`)
   - `PORT`: 5000
   - `TOKEN_EXPIRES_IN`: 7d
6. Click "Create Web Service"
7. Note your backend URL (e.g., https://fitness-tracker-api.onrender.com)

### Step 3: Deploy Frontend
1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: fitness-tracker-app
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: Your backend URL + /api (e.g., https://fitness-tracker-api.onrender.com/api)
5. Click "Create Static Site"

### Step 4: Test Deployment
1. Visit your frontend URL
2. Sign up for a new account
3. Log in and test logging food/workouts
4. Check the dashboard summary

### Notes on Render Deployment
- Free tier services may spin down after inactivity (cold starts)
- First request after inactivity may take 30-60 seconds
- For production, consider upgrading to paid tiers for better performance
- Set up custom domains in Render dashboard if needed

## Postman Collection

Import `misc/postman_collection.json` into Postman for ready-to-use API requests. The collection includes:
- Auth (signup, login)
- Workouts (create, list)
- Food logs (create, list)
- Summary (get today's summary)
- Health check

## License

MIT

## Author

Created as a student project for learning full-stack MERN development.
