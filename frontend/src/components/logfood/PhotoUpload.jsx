import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, AlertCircle } from 'lucide-react'

export default function PhotoUpload({ onSubmit, isProcessing }) {
  const fileInputRef = useRef(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)

  const handlePhotoCapture = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setAnalyzing(true)
    setError(null)
    
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1]
          
          console.log('📸 Sending image to backend...')
          
          const response = await fetch('http://localhost:5000/api/analyze-food', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 })
          })
          
          const data = await response.json()
          console.log('Response:', data)
          
          if (data.success) {
            console.log('✅ Food detected:', data.food_name)
            // Pass both food data and the original image base64
            onSubmit(data, e.target.result) // Pass full data URL for image display
          } else {
            setError(data.error || 'Failed to analyze food')
          }
        } catch (err) {
          console.error('Error:', err)
          setError('Could not connect to backend. Is it running on port 5000?')
        } finally {
          setAnalyzing(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setError('Error processing image')
      setAnalyzing(false)
    }
  }

  return (
    <div className="text-center py-8">
      <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <p className="text-gray-600 mb-4">Take a photo of your meal</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoCapture}
        className="hidden"
      />
      
      <Button 
        onClick={() => fileInputRef.current?.click()}
        disabled={analyzing || isProcessing}
      >
        {analyzing ? '⏳ Analyzing with AI...' : '📸 Upload Photo'}
      </Button>
    </div>
  )
}