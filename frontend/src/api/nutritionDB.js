const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'

export const searchFoodUSDA = async (foodName) => {
  try {
    const response = await fetch(
      `${USDA_API_URL}?query=${encodeURIComponent(foodName)}&pageSize=5&api_key=${USDA_API_KEY}`
    )
    
    const data = await response.json()
    
    if (!data.foods || data.foods.length === 0) {
      return null
    }
    
    // Get the first (most relevant) result
    const food = data.foods[0]
    
    // Extract nutrition info
    const nutrients = {}
    food.foodNutrients?.forEach(nutrient => {
      if (nutrient.nutrientName === 'Energy') {
        nutrients.calories = Math.round(nutrient.value * 0.239) // Convert kJ to kcal
      }
      if (nutrient.nutrientName === 'Protein') {
        nutrients.protein = nutrient.value
      }
      if (nutrient.nutrientName === 'Carbohydrate, by difference') {
        nutrients.carbs = nutrient.value
      }
      if (nutrient.nutrientName === 'Total lipid (fat)') {
        nutrients.fats = nutrient.value
      }
    })
    
    return {
      food_name: food.description,
      calories: nutrients.calories || 0,
      protein_g: nutrients.protein || 0,
      carbs_g: nutrients.carbs || 0,
      fats_g: nutrients.fats || 0,
      source: 'USDA'
    }
  } catch (error) {
    console.error('Error fetching from USDA:', error)
    return null
  }
}