// Utility functions

/**
 * Creates a page URL for navigation
 * @param {string} pageName - The page name (e.g., 'Dashboard', 'Onboarding')
 * @returns {string} The page route
 */
export const createPageUrl = (pageName) => {
  const pageMap = {
    'Onboarding': '/onboarding',
    'Dashboard': '/dashboard',
    'LogFood': '/log-food',
    'Leaderboards': '/leaderboards',
    'Feed': '/feed',
    'Communities': '/communities',
    'Profile': '/profile',
  }
  return pageMap[pageName] || `/${pageName.toLowerCase()}`
}

/**
 * Format calories for display
 */
export const formatCalories = (calories) => {
  return Math.round(calories).toLocaleString()
}

/**
 * Format macros (protein, carbs, fats)
 */
export const formatMacros = (value) => {
  return Math.round(value)
}

/**
 * Calculate calorie deficit/surplus
 */
export const calculateCalorieBalance = (consumed, target) => {
  return consumed - target
}

/**
 * Format date for display
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Calculate BMI
 */
export const calculateBMI = (weightKg, heightCm) => {
  const heightM = heightCm / 100
  return (weightKg / (heightM * heightM)).toFixed(1)
}