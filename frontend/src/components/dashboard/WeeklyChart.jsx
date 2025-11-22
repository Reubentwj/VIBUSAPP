import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

export default function WeeklyChart({ userEmail }) {
  const [chartData, setChartData] = useState([])
  const [view, setView] = useState('calories') // 'calories' or 'macros'

  useEffect(() => {
    // Generate fake weekly data
    const generateWeeklyData = () => {
      const data = []
      const today = new Date()
      
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i)
        const dayName = format(date, 'EEE')
        
        // Generate fake data with some variation
        const baseCalories = 1950 + Math.random() * 300
        const calorieGoal = 2000
        
        data.push({
          day: dayName,
          date: format(date, 'MM/dd'),
          calories: Math.round(baseCalories),
          goal: calorieGoal,
          protein: Math.round(130 + Math.random() * 40),
          carbs: Math.round(190 + Math.random() * 50),
          fats: Math.round(55 + Math.random() * 20),
          proteinGoal: 150,
          carbsGoal: 200,
          fatsGoal: 65
        })
      }
      
      return data
    }

    setChartData(generateWeeklyData())
  }, [])

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle>Weekly Analytics</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setView('calories')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                view === 'calories'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Calories
            </button>
            <button
              onClick={() => setView('macros')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                view === 'macros'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Macros
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calories View */}
            {view === 'calories' && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Daily Calorie Intake vs Goal</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="day" 
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value} cal`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="calories"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Actual"
                    />
                    <Line
                      type="monotone"
                      dataKey="goal"
                      stroke="#9ca3af"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#9ca3af', r: 5 }}
                      name="Goal"
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Weekly Stats */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs text-gray-600">Avg Daily</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {Math.round(chartData.reduce((sum, d) => sum + d.calories, 0) / chartData.length)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">calories</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600">Highest Day</p>
                    <p className="text-xl font-bold text-blue-600">
                      {Math.max(...chartData.map(d => d.calories))}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">calories</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-gray-600">Lowest Day</p>
                    <p className="text-xl font-bold text-orange-600">
                      {Math.min(...chartData.map(d => d.calories))}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">calories</p>
                  </div>
                </div>
              </div>
            )}

            {/* Macros View */}
            {view === 'macros' && (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Daily Macronutrient Breakdown</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="day"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => `${value}g`}
                    />
                    <Legend />
                    <Bar
                      dataKey="protein"
                      fill="#3b82f6"
                      name="Protein"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="carbs"
                      fill="#f59e0b"
                      name="Carbs"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="fats"
                      fill="#a855f7"
                      name="Fats"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Macro Averages */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600">Avg Protein</p>
                    <p className="text-xl font-bold text-blue-600">
                      {Math.round(chartData.reduce((sum, d) => sum + d.protein, 0) / chartData.length)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">grams</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-gray-600">Avg Carbs</p>
                    <p className="text-xl font-bold text-orange-600">
                      {Math.round(chartData.reduce((sum, d) => sum + d.carbs, 0) / chartData.length)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">grams</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600">Avg Fats</p>
                    <p className="text-xl font-bold text-purple-600">
                      {Math.round(chartData.reduce((sum, d) => sum + d.fats, 0) / chartData.length)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">grams</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}