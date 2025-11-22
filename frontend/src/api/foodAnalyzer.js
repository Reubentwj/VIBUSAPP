export const analyzeFood = async (imageBase64) => {
  try {
    const response = await fetch('http://localhost:5000/api/analyze-food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to analyze food')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error analyzing food:', error)
    throw error
  }
}