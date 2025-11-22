import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Target, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ActivityGoalsStep({ data, onUpdate }) {
  return (
    <Card className="bg-white/90 backdrop-blur-lg border-2 border-gray-200 p-8 shadow-2xl">
      <div className="mb-6">
        <div className="inline-block p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Activity & Goals</h2>
        <p className="text-gray-600">Tell us about your lifestyle and what you want to achieve</p>
      </div>

      <div className="space-y-8">
        {/* Activity Level */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">Activity Level *</Label>
          <RadioGroup value={data.activity_level} onValueChange={(value) => onUpdate({ activity_level: value })}>
            <div className="space-y-3">
              {[
                { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
                { value: 'very_active', label: 'Extremely Active', desc: 'Very hard exercise & physical job' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    data.activity_level === option.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={option.value} className="mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Goal Type */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">Weight Goal *</Label>
          <RadioGroup value={data.goal_type} onValueChange={(value) => onUpdate({ goal_type: value })}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label
                className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  data.goal_type === 'lose'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="lose" className="mb-3" />
                <TrendingDown className="w-8 h-8 text-red-500 mb-2" />
                <div className="font-semibold text-gray-900">Lose Weight</div>
              </label>

              <label
                className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  data.goal_type === 'maintain'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="maintain" className="mb-3" />
                <Minus className="w-8 h-8 text-blue-500 mb-2" />
                <div className="font-semibold text-gray-900">Maintain</div>
              </label>

              <label
                className={`flex flex-col items-center p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  data.goal_type === 'gain'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="gain" className="mb-3" />
                <TrendingUp className="w-8 h-8 text-green-500 mb-2" />
                <div className="font-semibold text-gray-900">Gain Weight</div>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Goal Aggression */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">How Fast? *</Label>
          <RadioGroup value={data.goal_aggression} onValueChange={(value) => onUpdate({ goal_aggression: value })}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'conservative', label: 'Conservative', desc: '±250 cal/day' },
                { value: 'moderate', label: 'Moderate', desc: '±400 cal/day' },
                { value: 'aggressive', label: 'Aggressive', desc: '±600 cal/day' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    data.goal_aggression === option.value
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={option.value} className="mb-3" />
                  <div className="font-semibold text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>
    </Card>
  );
}