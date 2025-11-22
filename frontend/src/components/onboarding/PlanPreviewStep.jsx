import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, Target, TrendingUp, Flame, Apple } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function PlanPreviewStep({ data }) {
  const expectedWeightChange = () => {
    const weeklyChange = (data.goal_aggression === 'conservative' ? 0.25 : 
                          data.goal_aggression === 'moderate' ? 0.4 : 0.6);
    return data.goal_type === 'lose' ? -weeklyChange : 
           data.goal_type === 'gain' ? weeklyChange : 0;
  };

  const proteinPercent = Math.round((data.daily_protein_g * 4 / data.daily_calories) * 100);
  const carbsPercent = Math.round((data.daily_carbs_g * 4 / data.daily_calories) * 100);
  const fatsPercent = Math.round((data.daily_fats_g * 9 / data.daily_calories) * 100);

  return (
    <Card className="bg-white/90 backdrop-blur-lg border-2 border-gray-200 p-8 shadow-2xl">
      <div className="mb-6">
        <div className="inline-block p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Personalized Plan</h2>
        <p className="text-gray-600">Here's your AI-generated nutrition plan based on your goals</p>
      </div>

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6 text-emerald-600" />
              <span className="text-sm font-medium text-gray-600">Daily Calories</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">{data.daily_calories}</p>
            <p className="text-sm text-gray-600 mt-1">cal/day</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Expected Change</span>
            </div>
            <p className="text-4xl font-bold text-gray-900">
              {expectedWeightChange() > 0 ? '+' : ''}{expectedWeightChange()}
            </p>
            <p className="text-sm text-gray-600 mt-1">kg/week</p>
          </div>
        </div>

        {/* Macro Breakdown */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Apple className="w-5 h-5 text-purple-600" />
            Macro Targets
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Protein</span>
                <span className="text-sm font-bold text-blue-600">{data.daily_protein_g}g ({proteinPercent}%)</span>
              </div>
              <Progress value={proteinPercent} className="h-3 bg-blue-100" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Carbs</span>
                <span className="text-sm font-bold text-orange-600">{data.daily_carbs_g}g ({carbsPercent}%)</span>
              </div>
              <Progress value={carbsPercent} className="h-3 bg-orange-100" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Fats</span>
                <span className="text-sm font-bold text-purple-600">{data.daily_fats_g}g ({fatsPercent}%)</span>
              </div>
              <Progress value={fatsPercent} className="h-3 bg-purple-100" />
            </div>
          </div>
        </div>

        {/* Metabolic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Basal Metabolic Rate (BMR)</p>
            <p className="text-2xl font-bold text-gray-900">{data.bmr} cal</p>
          </div>

          <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Daily Energy Expenditure</p>
            <p className="text-2xl font-bold text-gray-900">{data.tdee} cal</p>
          </div>
        </div>

        {/* Goal Summary */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-2xl text-white">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-6 h-6" />
            <h3 className="text-lg font-bold">Your Goal</h3>
          </div>
          <p className="text-white/90">
            {data.goal_type === 'lose' && 'You\'re on a calorie deficit to lose weight gradually and sustainably.'}
            {data.goal_type === 'gain' && 'You\'re on a calorie surplus to gain weight and build muscle.'}
            {data.goal_type === 'maintain' && 'You\'re eating at maintenance to keep your current weight.'}
          </p>
          <p className="text-white/90 mt-2">
            With {data.goal_aggression} progression, you can expect to see results within a few weeks!
          </p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-900">
            <strong>Ready to start?</strong> Click "Start My Journey" to save your plan and begin tracking your nutrition!
          </p>
        </div>
      </div>
    </Card>
  );
}