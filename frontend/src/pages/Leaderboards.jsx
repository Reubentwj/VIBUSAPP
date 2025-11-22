import React, { useState, useEffect } from 'react';
import { client } from '@/api/client'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, Users, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { calculateDailyPoints } from '@/utils/leaderboard';

export default function Leaderboards() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await client.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Initialize fake users on component mount
  useEffect(() => {
    const initializeFakeUsers = async () => {
      try {
        // First, delete all existing fake users (those with @example.com emails)
        const allUsers = await client.entities.User.list();
        const fakeUserEmails = allUsers
          .filter(u => u.email && u.email.includes('@example.com'))
          .map(u => u.email);
        
        // Remove fake users from localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter(u => !fakeUserEmails.includes(u.email));
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        console.log(`🗑️ Deleted ${fakeUserEmails.length} fake users`);
        
        // Now create only 3 fake users
        const existingUsers = await client.entities.User.list();
        const existingEmails = existingUsers.map(u => u.email);
        
        // Only 3 fake users
        const fakeUsers = [
          {
            email: 'champion@example.com',
            full_name: 'Alex Champion',
            daily_calories: 2000,
            daily_protein_g: 150,
            daily_carbs_g: 200,
            daily_fats_g: 60,
            actual_calories: 1980,
            actual_protein: 148,
            actual_carbs: 198,
            actual_fats: 59,
            leaderboard_points: calculateDailyPoints(1980, 2000, 148, 150, 198, 200, 59, 60),
            current_streak: 15,
            longest_streak: 30,
            total_logs: 120,
            total_points: 0,
            avatar_url: null
          },
          {
            email: 'fitnessfan@example.com',
            full_name: 'Sarah Fitness',
            daily_calories: 2200,
            daily_protein_g: 165,
            daily_carbs_g: 220,
            daily_fats_g: 65,
            actual_calories: 2100,
            actual_protein: 158,
            actual_carbs: 210,
            actual_fats: 62,
            leaderboard_points: calculateDailyPoints(2100, 2200, 158, 165, 210, 220, 62, 65),
            current_streak: 10,
            longest_streak: 20,
            total_logs: 85,
            total_points: 0,
            avatar_url: null
          },
          {
            email: 'healthnut@example.com',
            full_name: 'Mike Healthy',
            daily_calories: 1800,
            daily_protein_g: 135,
            daily_carbs_g: 180,
            daily_fats_g: 55,
            actual_calories: 1700,
            actual_protein: 128,
            actual_carbs: 170,
            actual_fats: 52,
            leaderboard_points: calculateDailyPoints(1700, 1800, 128, 135, 170, 180, 52, 55),
            current_streak: 8,
            longest_streak: 18,
            total_logs: 70,
            total_points: 0,
            avatar_url: null
          }
        ];

        // Create the 3 fake users if they don't exist
        for (const fakeUser of fakeUsers) {
          if (!existingEmails.includes(fakeUser.email)) {
            await client.entities.User.create({
              email: fakeUser.email,
              full_name: fakeUser.full_name,
              daily_calories: fakeUser.daily_calories,
              daily_protein_g: fakeUser.daily_protein_g,
              daily_carbs_g: fakeUser.daily_carbs_g,
              daily_fats_g: fakeUser.daily_fats_g,
              leaderboard_points: fakeUser.leaderboard_points,
              current_streak: fakeUser.current_streak,
              longest_streak: fakeUser.longest_streak,
              total_logs: fakeUser.total_logs,
              total_points: fakeUser.total_points,
              avatar_url: fakeUser.avatar_url
            });
            console.log(`✅ Created fake user: ${fakeUser.full_name} with ${fakeUser.leaderboard_points} points`);
          }
        }

        // Ensure current user (testuser) exists in users list
        const currentUser = await client.auth.me();
        if (currentUser) {
          const userEmail = currentUser.email || 'testuser';
          
          if (!currentUser.email) {
            await client.auth.updateMe({ email: userEmail });
          }
          
          const userInList = existingUsers.find(u => u.email === userEmail);
          
          // Calculate points for current user (2nd place - between champion and fitnessfan)
          const userActualCal = 1950;
          const userActualProt = 145;
          const userActualCarbs = 195;
          const userActualFats = 58;
          const userTargetCal = currentUser.daily_calories || 2000;
          const userTargetProt = currentUser.daily_protein_g || 150;
          const userTargetCarbs = currentUser.daily_carbs_g || 200;
          const userTargetFats = currentUser.daily_fats_g || 60;
          const userPoints = calculateDailyPoints(
            userActualCal, userTargetCal,
            userActualProt, userTargetProt,
            userActualCarbs, userTargetCarbs,
            userActualFats, userTargetFats
          );
          
          if (!userInList) {
            await client.entities.User.create({
              email: userEmail,
              full_name: currentUser.full_name || 'Test User',
              daily_calories: userTargetCal,
              daily_protein_g: userTargetProt,
              daily_carbs_g: userTargetCarbs,
              daily_fats_g: userTargetFats,
              leaderboard_points: userPoints,
              current_streak: currentUser.current_streak || 12,
              longest_streak: currentUser.longest_streak || 25,
              total_logs: currentUser.total_logs || 95,
              total_points: currentUser.total_points || 0,
              avatar_url: currentUser.avatar_url || null
            });
            console.log(`✅ Created current user in leaderboard: ${userEmail} with ${userPoints} points`);
          } else {
            // Update existing user
            await client.entities.User.update(userInList.id || userEmail, {
              leaderboard_points: userPoints,
              full_name: currentUser.full_name || userInList.full_name,
              daily_calories: userTargetCal,
              daily_protein_g: userTargetProt,
              daily_carbs_g: userTargetCarbs,
              daily_fats_g: userTargetFats,
              total_points: currentUser.total_points || userInList.total_points || 0
            });
            console.log(`✅ Updated current user in leaderboard: ${userEmail} with ${userPoints} points`);
          }
        }

        // Create friendships between testuser and the 3 fake users (for friends leaderboard)
        if (currentUser && (currentUser.email === 'testuser' || !currentUser.email)) {
          const friendshipsToCreate = [
            { user_email: 'testuser', friend_email: 'champion@example.com', status: 'accepted' },
            { user_email: 'testuser', friend_email: 'fitnessfan@example.com', status: 'accepted' },
            { user_email: 'testuser', friend_email: 'healthnut@example.com', status: 'accepted' }
          ];

          const existingFriendships = await client.entities.Friendship.filter({ user_email: 'testuser' });
          const existingFriendEmails = existingFriendships.map(f => f.friend_email);

          for (const friendship of friendshipsToCreate) {
            if (!existingFriendEmails.includes(friendship.friend_email)) {
              await client.entities.Friendship.create(friendship);
              console.log(`✅ Created friendship: testuser <-> ${friendship.friend_email}`);
            }
          }
        }

        // Invalidate query to refetch users
        queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      } catch (error) {
        console.error('Error initializing fake users:', error);
      }
    };

    initializeFakeUsers();
  }, [queryClient]);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const users = await client.entities.User.list('-leaderboard_points');
      console.log('📊 Fetched users:', users.length);
      return users || [];
    },
    initialData: [],
    refetchInterval: 3000 // Refetch every 3 seconds to catch new users
  });

  const { data: friendships } = useQuery({
    queryKey: ['friendships', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await client.entities.Friendship.filter({
        user_email: user.email,
        status: 'accepted'
      });
    },
    enabled: !!user,
    initialData: []
  });

  const friendEmails = friendships.map(f => f.friend_email);
  const friendsLeaderboard = allUsers.filter(u => friendEmails.includes(u.email));
  
  // Local leaderboard - show all fake users (excluding current user)
  const localLeaderboard = allUsers.filter(u => 
    u.email !== user?.email && 
    (u.email.includes('@example.com') || u.email === 'testuser')
  );

  // Calculate points based on rank position
  const getPointsFromRank = (rank, leaderboardType = 'global') => {
    // Different point systems for different leaderboards
    const pointSystems = {
      global: [100, 75, 50, 40, 30, 25, 20, 15, 10, 5], // Top 10 get points
      friends: [50, 35, 25, 20, 15, 10, 5], // Top 7 get points
      local: [75, 50, 35, 25, 20, 15, 10, 5] // Top 8 get points
    };
    
    const points = pointSystems[leaderboardType] || pointSystems.global;
    if (rank < points.length) {
      return points[rank];
    }
    return 0;
  };

  // Calculate user's points from each leaderboard
  const globalRank = allUsers.findIndex(u => u.email === user?.email);
  const friendsRank = friendsLeaderboard.findIndex(u => u.email === user?.email);
  const localRank = localLeaderboard.findIndex(u => u.email === user?.email);

  const globalPoints = globalRank >= 0 ? getPointsFromRank(globalRank, 'global') : 0;
  const friendsPoints = friendsRank >= 0 ? getPointsFromRank(friendsRank, 'friends') : 0;
  const localPoints = localRank >= 0 ? getPointsFromRank(localRank, 'local') : 0;
  const totalRankingPoints = globalPoints + friendsPoints + localPoints;
  
  // Get user's total accumulated points (currency) - from challenges, rankings, etc.
  const userTotalPoints = user?.total_points || 0;
  const overallTotalPoints = userTotalPoints + totalRankingPoints;

  const getRankIcon = (rank) => {
    if (rank === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 2) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank + 1}</span>;
  };

  const LeaderboardList = ({ users, userEmail, leaderboardType = 'global' }) => {
    const getPointsForRank = (rank) => {
      return getPointsFromRank(rank, leaderboardType);
    };

    return (
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No users yet</p>
          </div>
        ) : (
          users.map((u, index) => {
            const isCurrentUser = u.email === userEmail;
            const rankPoints = getPointsForRank(index);
            return (
              <div
                key={u.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-lg'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 flex items-center justify-center">
                  {getRankIcon(index)}
                </div>

                <Avatar className="h-12 w-12">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    {u.full_name?.[0] || u.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    {u.full_name || 'User'}
                    {isCurrentUser && (
                      <Badge className="ml-2 bg-emerald-600">You</Badge>
                    )}
                  </p>
                  <p className="text-sm text-gray-600">
                    {u.current_streak || 0} day streak • {u.total_logs || 0} meals logged
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">
                    {u.leaderboard_points || 0}
                  </p>
                  <p className="text-xs text-gray-500">total points</p>
                  {rankPoints > 0 && (
                    <p className="text-xs text-emerald-500 font-semibold mt-1">
                      +{rankPoints} from rank
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                🏆 Leaderboards
              </h1>
              <p className="text-gray-600">
                Compete with friends and the community based on diet adherence
              </p>
            </div>
            {/* Overall Points Counter (Currency) */}
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl border-0 w-full md:w-auto md:min-w-[200px]">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-1">Total Points (Currency)</p>
                  <p className="text-4xl font-bold">{overallTotalPoints.toLocaleString()}</p>
                  <div className="mt-2 pt-2 border-t border-white/20 text-xs">
                    <div className="flex justify-between gap-2">
                      <span>From Rankings:</span>
                      <span className="font-semibold text-yellow-200">+{totalRankingPoints}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span>From Challenges:</span>
                      <span className="font-semibold">{userTotalPoints}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="flex justify-between gap-2">
                        <span>Global:</span>
                        <span className="font-semibold">+{globalPoints}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Friends:</span>
                        <span className="font-semibold">+{friendsPoints}</span>
                      </div>
                      {localPoints > 0 && (
                        <div className="flex justify-between gap-2">
                          <span>Local:</span>
                          <span className="font-semibold">+{localPoints}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="global" className="space-y-6">
          <div className="mb-6">
            <Select defaultValue="global" onValueChange={(value) => {
              const tabs = document.querySelector('[role="tablist"]');
              const trigger = tabs?.querySelector(`[value="${value}"]`);
              trigger?.click();
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select leaderboard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Global Leaderboard
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Friends Leaderboard
                  </div>
                </SelectItem>
                <SelectItem value="local">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Local Leaderboard
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsList className="hidden">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <Card className="shadow-2xl border-2">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Global Leaderboard
                </CardTitle>
                <p className="text-white/90 text-sm">
                  Top performers worldwide • Resets monthly
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <LeaderboardList users={allUsers.slice(0, 50)} userEmail={user.email} leaderboardType="global" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends">
            <Card className="shadow-2xl border-2">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Friends Leaderboard
                </CardTitle>
                <p className="text-white/90 text-sm">
                  Compete with your friends • Resets weekly
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <LeaderboardList users={friendsLeaderboard} userEmail={user.email} leaderboardType="friends" />
                {friendsLeaderboard.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 mb-2">No friends added yet</p>
                    <p className="text-sm text-gray-500">
                      Add friends to compete in this leaderboard!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="local">
            <Card className="shadow-2xl border-2">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Local Leaderboard
                </CardTitle>
                <p className="text-white/90 text-sm">
                  Compete in your area • Resets monthly
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <LeaderboardList users={localLeaderboard} userEmail={user.email} leaderboardType="local" />
                {localLeaderboard.length === 0 && (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 mb-2">No local users yet</p>
                    <p className="text-sm text-gray-500">
                      We'll match you with people in your area!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Your Rank Summary */}
        <Card className="mt-6 shadow-lg border-2 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border-2 border-emerald-200">
                <p className="text-sm text-gray-600 mb-1">Global Rank</p>
                <p className="text-2xl font-bold text-emerald-600">
                  #{allUsers.findIndex(u => u.email === user.email) + 1}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total Points</p>
                <p className="text-2xl font-bold text-blue-600">
                  {user.leaderboard_points || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-purple-600">
                  {user.current_streak || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border-2 border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Best Streak</p>
                <p className="text-2xl font-bold text-orange-600">
                  {user.longest_streak || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}