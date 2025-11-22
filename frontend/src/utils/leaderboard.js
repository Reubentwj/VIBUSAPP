/**
 * Calculate daily points based on deviation from macro targets
 * Lower deviation = higher points
 * 
 * @param {number} actualCal - Actual calories consumed
 * @param {number} targetCal - Target calories
 * @param {number} actualProt - Actual protein (g)
 * @param {number} targetProt - Target protein (g)
 * @param {number} actualCarbs - Actual carbs (g)
 * @param {number} targetCarbs - Target carbs (g)
 * @param {number} actualFats - Actual fats (g)
 * @param {number} targetFats - Target fats (g)
 * @returns {number} Points (0-100, where 100 is perfect match)
 */
export function calculateDailyPoints(
  actualCal, targetCal,
  actualProt, targetProt,
  actualCarbs, targetCarbs,
  actualFats, targetFats
) {
  // Calculate deviation percentage for each macro
  const calDeviation = Math.abs(actualCal - targetCal) / targetCal;
  const protDeviation = Math.abs(actualProt - targetProt) / targetProt;
  const carbsDeviation = Math.abs(actualCarbs - targetCarbs) / targetCarbs;
  const fatsDeviation = Math.abs(actualFats - targetFats) / targetFats;
  
  // Average deviation across all macros
  const avgDeviation = (calDeviation + protDeviation + carbsDeviation + fatsDeviation) / 4;
  
  // Convert to points: 0% deviation = 100 points, 100% deviation = 0 points
  // Using a curve that penalizes more for higher deviations
  const points = Math.max(0, Math.round(100 * (1 - avgDeviation * 1.2)));
  
  return points;
}

