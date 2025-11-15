const axios = require('axios');

// Free Nutrition API - Edamam (credentials from .env)
const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
const EDAMAM_API_BASE = 'https://api.edamam.com/api/nutrition-data';

// Built-in nutrition database for common foods (per 100g)
const nutritionDatabase = {
  // Grains & Carbs
  'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  'brown rice': { calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  'bread': { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  'oatmeal': { calories: 68, protein: 2.4, carbs: 12, fat: 1.4 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  
  // Proteins
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'chicken': { calories: 239, protein: 27, carbs: 0, fat: 14 },
  'beef': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'pork': { calories: 242, protein: 27, carbs: 0, fat: 14 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13 },
  'tuna': { calories: 132, protein: 28, carbs: 0, fat: 1.3 },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  
  // Dairy
  'milk': { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
  
  // Fruits
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
  'strawberry': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  
  // Vegetables
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'carrot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  
  // Nuts & Seeds
  'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50 },
  'peanuts': { calories: 567, protein: 26, carbs: 16, fat: 49 },
  'cashews': { calories: 553, protein: 18, carbs: 30, fat: 44 },
  
  // Others
  'avocado': { calories: 160, protein: 2, carbs: 8.5, fat: 15 },
  'pizza': { calories: 266, protein: 11, carbs: 33, fat: 10 },
  'burger': { calories: 295, protein: 17, carbs: 24, fat: 14 },
};

/**
 * Search built-in nutrition database
 * Scales nutrients based on quantity
 */
const searchLocalDatabase = (foodName, quantity = 100) => {
  const query = foodName.toLowerCase().trim();
  let foodData = null;
  
  // Direct match
  if (nutritionDatabase[query]) {
    foodData = nutritionDatabase[query];
  } else {
    // Partial match
    for (const [key, value] of Object.entries(nutritionDatabase)) {
      if (key.includes(query) || query.includes(key)) {
        foodData = value;
        break;
      }
    }
  }
  
  if (!foodData) return null;
  
  // Scale nutrients based on quantity
  const scale = quantity / 100;
  return {
    name: foodName,
    quantity: quantity,
    calories: Math.round(foodData.calories * scale),
    protein: Math.round(foodData.protein * scale * 10) / 10,
    carbs: Math.round(foodData.carbs * scale * 10) / 10,
    fat: Math.round(foodData.fat * scale * 10) / 10,
    servingSize: `${quantity}g`,
    source: 'Database',
  };
};

/**
 * Search for food using Edamam Nutrition API (Free with demo credentials)
 * Returns nutrition information for any food with specified quantity
 */
const searchFoodEdamam = async (foodName, quantity = 100) => {
  try {
    // Edamam expects format like "1 apple" or "100g chicken breast"
    const query = `${quantity}g ${foodName}`;
    
    const response = await axios.get(EDAMAM_API_BASE, {
      params: {
        app_id: EDAMAM_APP_ID,
        app_key: EDAMAM_APP_KEY,
        ingr: query,
      },
    });

    const data = response.data;
    
    if (data.calories > 0) {
      return {
        name: foodName,
        quantity: quantity,
        calories: Math.round(data.calories) || 0,
        protein: Math.round(data.totalNutrients?.PROCNT?.quantity || 0),
        carbs: Math.round(data.totalNutrients?.CHOCDF?.quantity || 0),
        fat: Math.round(data.totalNutrients?.FAT?.quantity || 0),
        servingSize: `${quantity}g`,
        source: 'Edamam API',
      };
    }

    return null;
  } catch (error) {
    console.error('Edamam API Error:', error.message);
    return null;
  }
};

/**
 * Main function to get nutrition info
 * Tries Edamam API first, then local database as fallback
 */
const getNutritionInfo = async (foodName, quantity = 100) => {
  // Try Edamam API first (supports any food)
  let nutrition = await searchFoodEdamam(foodName, quantity);
  if (nutrition) {
    return nutrition;
  }

  // Fallback to local database
  nutrition = searchLocalDatabase(foodName, quantity);
  if (nutrition) {
    return nutrition;
  }

  // If both fail, return null (let user enter manually)
  return null;
};

/**
 * Calculate calories burned based on workout type and duration
 * Using MET (Metabolic Equivalent of Task) values
 */
const calculateCaloriesBurned = (workoutType, duration, userWeight = 70) => {
  // MET values for common exercises
  const metValues = {
    // Cardio
    running: 9.8,
    jogging: 7.0,
    walking: 3.8,
    cycling: 7.5,
    swimming: 7.0,
    hiking: 6.0,
    
    // Strength
    'weight training': 6.0,
    'strength training': 6.0,
    weightlifting: 6.0,
    bodyweight: 5.0,
    
    // Sports
    basketball: 6.5,
    soccer: 7.0,
    tennis: 7.3,
    badminton: 5.5,
    volleyball: 4.0,
    
    // Other
    yoga: 3.0,
    pilates: 3.5,
    dancing: 4.5,
    aerobics: 7.0,
    zumba: 6.5,
    hiit: 8.0,
  };

  const type = workoutType.toLowerCase();
  let met = 5.0; // Default moderate exercise

  // Find matching MET value
  for (const [key, value] of Object.entries(metValues)) {
    if (type.includes(key)) {
      met = value;
      break;
    }
  }

  // Formula: Calories = MET × weight(kg) × duration(hours)
  const caloriesBurned = met * userWeight * (duration / 60);
  return Math.round(caloriesBurned);
};

module.exports = {
  getNutritionInfo,
  calculateCaloriesBurned,
};
