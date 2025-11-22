import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ChevronRight, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TodayProgress({ 
  caloriesRemaining, 
  proteinRemaining, 
  carbsRemaining, 
  fatsRemaining,
  subscription 
}) {
  const isPremium = subscription === 'paid';

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Today's Remaining
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
              <p className="text-sm text-gray-600 mb-1">Calories</p>
              <p className={`text-2xl font-bold ${caloriesRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {caloriesRemaining > 0 ? caloriesRemaining : 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Protein</p>
              <p className={`text-2xl font-bold ${proteinRemaining < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                {Math.round(proteinRemaining > 0 ? proteinRemaining : 0)}g
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Carbs</p>
              <p className={`text-2xl font-bold ${carbsRemaining < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {Math.round(carbsRemaining > 0 ? carbsRemaining : 0)}g
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Fats</p>
              <p className={`text-2xl font-bold ${fatsRemaining < 0 ? 'text-red-600' : 'text-purple-600'}`}>
                {Math.round(fatsRemaining > 0 ? fatsRemaining : 0)}g
              </p>
            </div>
          </div>

          {!isPremium && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="font-bold">Upgrade to Premium</span>
                </div>
                <p className="text-sm text-white/90 mb-3">
                  Get AI meal recommendations, personalized plans, and more!
                </p>
                <Badge className="bg-white text-orange-600 hover:bg-white/90">
                  Coming Soon
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}