import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { searchFoodUSDA } from '@/api/nutritionDB'

export default function FoodSearch({ onSubmit, isProcessing }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [mealType, setMealType] = useState('lunch')
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setSearchResults(null)

    try {
      const result = await searchFoodUSDA(searchQuery)

      if (result) {
        setSearchResults(result)
      } else {
        setError(`"${searchQuery}" not found. Try another food or use manual entry.`)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error searching. Please try again.')
    }

    setIsSearching(false)
  }

  const handleSubmit = () => {
    if (searchResults) {
      onSubmit({ ...searchResults, meal_type: mealType })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="search">Search for Food</Label>
        <div className="flex gap-2">
          <Input
            id="search"
            placeholder="e.g., chicken breast, apple, pizza..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="text-lg"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {searchResults && (
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-900 mb-3">🔍 Search Result</p>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Food</p>
                <p className="font-bold text-gray-900">{searchResults.food_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600">Calories</p>
                  <p className="font-bold text-emerald-600">{searchResults.calories} cal</p>
                </div>
                <div>
                  <p className="text-gray-600">Protein</p>
                  <p className="font-bold text-blue-600">{searchResults.protein_g}g</p>
                </div>
                <div>
                  <p className="text-gray-600">Carbs</p>
                  <p className="font-bold text-orange-600">{searchResults.carbs_g}g</p>
                </div>
                <div>
                  <p className="text-gray-600">Fats</p>
                  <p className="font-bold text-purple-600">{searchResults.fats_g}g</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSearchResults(null)
                setSearchQuery('')
                setError(null)
              }}
              className="flex-1"
            >
              Search Again
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              {isProcessing ? 'Logging...' : 'Log This Meal'}
            </Button>
          </div>
        </div>
      )}

      {!searchResults && !error && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Search for any food to get nutrition info from USDA database</p>
          <p className="text-sm mt-2">Try: apple, chicken breast, rice, pizza, etc.</p>
        </div>
      )}
    </div>
  )
}