import React, { useState, useEffect } from 'react';
import { client } from '@/api/client'
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Award, Target, TrendingUp, Save } from 'lucide-react';

export default function Profile() {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await client.auth.me();
      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name || '',
        bio: currentUser.bio || ''
      });
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await client.auth.updateMe(formData);
      const updatedUser = await client.auth.me();
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setIsSaving(false);
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
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden shadow-2xl border-2">
          <div className="h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <CardContent className="p-6 -mt-16">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={user.avatar_url} />
<AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-4xl">
  {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {user.full_name || 'User'}
                  </h1>
                  <Badge className="bg-emerald-600">
                    {user.subscription_tier === 'paid' ? 'Premium' : 'Free'}
                  </Badge>
                </div>
                <p className="text-gray-600">{user.email}</p>
                {user.bio && (
                  <p className="text-gray-700 mt-2">{user.bio}</p>
                )}
              </div>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? 'outline' : 'default'}
                className={!isEditing ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : ''}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        {isEditing && (
          <Card className="mb-6 shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about your fitness journey..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 shadow-lg border-2 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {user.leaderboard_points || 0}
                </p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-lg border-2 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {user.current_streak || 0}
                </p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-lg border-2 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {user.total_logs || 0}
                </p>
                <p className="text-xs text-gray-600">Meals Logged</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-lg border-2 hover:border-emerald-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {user.longest_streak || 0}
                </p>
                <p className="text-xs text-gray-600">Best Streak</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Nutrition Goals */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Nutrition Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
                <p className="text-sm text-gray-600 mb-1">Daily Calories</p>
                <p className="text-2xl font-bold text-emerald-600">{user.daily_calories || 0}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Protein</p>
                <p className="text-2xl font-bold text-blue-600">{user.daily_protein_g || 0}g</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border-2 border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Carbs</p>
                <p className="text-2xl font-bold text-orange-600">{user.daily_carbs_g || 0}g</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Fats</p>
                <p className="text-2xl font-bold text-purple-600">{user.daily_fats_g || 0}g</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                Goal: {user.goal_type}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Pace: {user.goal_aggression}
              </Badge>
              <Badge className="bg-purple-100 text-purple-800">
                Activity: {user.activity_level}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}