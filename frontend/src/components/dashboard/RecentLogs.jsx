import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { createPageUrl } from '@/utils'
import { Plus, Flame } from 'lucide-react'
import { format } from 'date-fns'

export default function RecentLogs({ logs, isLoading }) {
  const navigate = useNavigate()

  console.log('🍽️ RecentLogs rendering with:', logs)

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle>Today's Meals ({logs?.length || 0})</CardTitle>
          <Button
            onClick={() => navigate(createPageUrl('LogFood'))}
            size="sm"
            className="bg-white text-emerald-600 hover:bg-gray-100"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Food
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{log.food_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(log.created_at), 'h:mm a')}
                    </p>
                  </div>
                  {log.meal_type && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full capitalize">
                      {log.meal_type}
                    </span>
                  )}
                </div>

                {/* Nutrition Grid */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-2 bg-white rounded border border-emerald-200">
                    <p className="text-xs text-gray-600 font-medium">Calories</p>
                    <p className="font-bold text-emerald-600 text-lg">{log.calories}</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-blue-200">
                    <p className="text-xs text-gray-600 font-medium">Protein</p>
                    <p className="font-bold text-blue-600 text-lg">{log.protein_g}g</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-orange-200">
                    <p className="text-xs text-gray-600 font-medium">Carbs</p>
                    <p className="font-bold text-orange-600 text-lg">{log.carbs_g}g</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-purple-200">
                    <p className="text-xs text-gray-600 font-medium">Fats</p>
                    <p className="font-bold text-purple-600 text-lg">{log.fats_g}g</p>
                  </div>
                </div>

                {/* Confidence Score */}
                {log.confidence_percent && (
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                    🤖 AI Confidence: {log.confidence_percent.toFixed(1)}%
                  </p>
                )}
              </div>
            ))}

            {/* Daily Totals */}
            <div className="mt-4 pt-4 border-t-2 border-gray-300">
              <p className="text-sm font-semibold text-gray-700 mb-3">Daily Totals</p>
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-gray-600">Total Calories</p>
                  <p className="font-bold text-emerald-600 text-xl">
                    {logs.reduce((sum, log) => sum + (log.calories || 0), 0)}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600">Total Protein</p>
                  <p className="font-bold text-blue-600 text-xl">
                    {logs.reduce((sum, log) => sum + (log.protein_g || 0), 0).toFixed(1)}g
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600">Total Carbs</p>
                  <p className="font-bold text-orange-600 text-xl">
                    {logs.reduce((sum, log) => sum + (log.carbs_g || 0), 0).toFixed(1)}g
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600">Total Fats</p>
                  <p className="font-bold text-purple-600 text-xl">
                    {logs.reduce((sum, log) => sum + (log.fats_g || 0), 0).toFixed(1)}g
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Flame className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium mb-2">No meals logged yet</p>
            <p className="text-gray-500 text-sm mb-4">Start tracking your nutrition today</p>
            <Button
              onClick={() => navigate(createPageUrl('LogFood'))}
              className="bg-gradient-to-r from-emerald-500 to-teal-500"
            >
              Log Your First Meal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}