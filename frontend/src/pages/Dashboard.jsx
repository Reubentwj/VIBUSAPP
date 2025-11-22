import React, { useState, useEffect } from 'react';
import { client } from '@/api/client'
import { useQuery } from '@tanstack/react-query';
import { Flame, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

import MacroRing from '../components/dashboard/MacroRing.jsx';
import RecentLogs from '../components/dashboard/RecentLogs.jsx';
import WeeklyChart from '../components/dashboard/WeeklyChart.jsx';
import DailyChallenges from '../components/dashboard/DailyChallenges.jsx';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [todayLogs, setTodayLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('📊 Loading dashboard data...')
        
        // Load user
        const currentUser = await client.auth.getMe();
        console.log('👤 User loaded:', currentUser)
        setUser(currentUser);

        // Load ALL today's food logs from localStorage (no user filtering)
        const today = format(new Date(), 'yyyy-MM-dd');
        console.log('📅 Loading logs for date:', today)
        
        const allLogs = await client.entities.FoodLog.list();
        console.log('📦 All logs from localStorage:', allLogs)
        
        // Filter by date only - show all meals logged today
        const filtered = allLogs.filter(log => {
          console.log(`Checking log: "${log.food_name}" - date: "${log.log_date}" vs "${today}"`)
          return log.log_date === today
        });
        
        console.log('✅ Today\'s logs:', filtered);
        setTodayLogs(filtered);

        // Initialize daily challenge if it doesn't exist
        const todayDate = format(new Date(), 'yyyy-MM-dd');
        const existingChallenges = await client.entities.DailyChallenge.filter({ date: todayDate });
        
        if (existingChallenges.length === 0) {
          await client.entities.DailyChallenge.create({
            title: 'Walk 10k Steps',
            description: 'Complete 10,000 steps today to earn points!',
            points: 50,
            challenge_type: 'activity',
            target_value: 10000,
            date: todayDate,
            is_premium: false
          });
          console.log('✅ Daily challenge initialized');
        }
        
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
      } finally {
        setLogsLoading(false);
      }
    };

    loadDashboardData();

    // Reload every 2 seconds to catch new logs
    const interval = setInterval(loadDashboardData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch daily challenges
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  const { data: dailyChallenges = [] } = useQuery({
    queryKey: ['dailyChallenges', todayDate],
    queryFn: async () => {
      return await client.entities.DailyChallenge.filter({ date: todayDate });
    },
    refetchInterval: 5000
  });

  // Calculate stats whenever logs change
  useEffect(() => {
    if (todayLogs && todayLogs.length > 0) {
      const totals = todayLogs.reduce(
        (acc, log) => ({
          calories: acc.calories + (log.calories || 0),
          protein: acc.protein + (log.protein_g || 0),
          carbs: acc.carbs + (log.carbs_g || 0),
          fats: acc.fats + (log.fats_g || 0)
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );
      setTodayStats(totals);
      console.log('📊 Today stats calculated:', totals)
    } else {
      setTodayStats({
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0
      });
    }
  }, [todayLogs]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const dailyCalorieGoal = user.daily_calories || 2000;
  const dailyProteinGoal = user.daily_protein_g || 150;
  const dailyCarbsGoal = user.daily_carbs_g || 200;
  const dailyFatsGoal = user.daily_fats_g || 60;

  // Calculate remaining (for calories wheel display)
  const caloriesRemaining = dailyCalorieGoal - todayStats.calories;

  // Check if over limit
  const isOverCalories = todayStats.calories > dailyCalorieGoal;
  const caloriesOver = todayStats.calories - dailyCalorieGoal;

  return (
    <div className="min-h-screen p-4 space-y-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hi {user.full_name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-sm text-gray-600">
            {format(new Date(), 'EEE, MMM d')}
          </p>
        </div>

        {/* Over Limit Warning */}
        {isOverCalories && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Over Your Calorie Goal!</p>
                <p className="text-red-800 text-sm mt-1">
                  You've consumed <span className="font-bold">{caloriesOver}</span> calories over your daily goal of {dailyCalorieGoal}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calories Wheel */}
        <div className={`rounded-2xl p-6 shadow-xl border-2 ${
          isOverCalories 
            ? 'bg-red-50 border-red-200' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={isOverCalories ? "url(#gradientRed)" : "url(#gradient)"}
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${Math.min((todayStats.calories / dailyCalorieGoal) * 552.92, 552.92)} 552.92`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                  <linearGradient id="gradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className={`w-8 h-8 mb-2 ${isOverCalories ? 'text-red-500' : 'text-emerald-500'}`} />
                <p className={`text-4xl font-bold ${isOverCalories ? 'text-red-600' : 'text-gray-900'}`}>
                  {isOverCalories ? `+${caloriesOver}` : Math.max(caloriesRemaining, 0)}
                </p>
                <p className={`text-xs mt-1 ${isOverCalories ? 'text-red-600' : 'text-gray-600'}`}>
                  {isOverCalories ? 'over goal' : 'cal left'}
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className={`text-sm mb-1 ${isOverCalories ? 'text-red-700' : 'text-gray-600'}`}>
                Today's Progress
              </p>
              <p className={`text-lg font-semibold ${isOverCalories ? 'text-red-900' : 'text-gray-900'}`}>
                {todayStats.calories} / {dailyCalorieGoal} cal
              </p>
            </div>
          </div>
        </div>

        {/* Macro Grid */}
        <div className="grid grid-cols-3 gap-3">
          <MacroRing
            label="Protein"
            current={todayStats.protein}
            target={dailyProteinGoal}
            color="from-blue-500 to-cyan-500"
            unit="g"
          />
          <MacroRing
            label="Carbs"
            current={todayStats.carbs}
            target={dailyCarbsGoal}
            color="from-orange-500 to-amber-500"
            unit="g"
          />
          <MacroRing
            label="Fats"
            current={todayStats.fats}
            target={dailyFatsGoal}
            color="from-purple-500 to-pink-500"
            unit="g"
          />
        </div>

        {/* Daily Challenges */}
        <DailyChallenges challenges={dailyChallenges} userEmail={user.email} />

        {/* Recent Logs - Shows today's meals */}
        <RecentLogs logs={todayLogs} isLoading={logsLoading} />

        {/* Weekly Chart */}
        <WeeklyChart userEmail={user.full_name} />
      </div>
    </div>
  );
}