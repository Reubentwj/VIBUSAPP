import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Shield, Eye, EyeOff, Users } from 'lucide-react';

export default function PrivacyStep({ data, onUpdate }) {
  return (
    <Card className="bg-white/90 backdrop-blur-lg border-2 border-gray-200 p-8 shadow-2xl">
      <div className="mb-6">
        <div className="inline-block p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Privacy Settings</h2>
        <p className="text-gray-600">Control what you share with the community</p>
      </div>

      <div className="space-y-8">
        {/* Profile Visibility */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">Profile Visibility</Label>
          <RadioGroup 
            value={data.profile_visibility} 
            onValueChange={(value) => onUpdate({ profile_visibility: value })}
          >
            <div className="space-y-3">
              <label
                className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  data.profile_visibility === 'public'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="public" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-gray-900">Public</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Anyone can see your profile and posts
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  data.profile_visibility === 'friends'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="friends" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Friends Only</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Only your friends can see your profile
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  data.profile_visibility === 'private'
                    ? 'border-gray-500 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <RadioGroupItem value="private" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <EyeOff className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Private</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Your profile is completely private
                  </div>
                </div>
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Granular Sharing Options */}
        {data.profile_visibility === 'public' && (
          <div className="space-y-4 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
            <Label className="text-base font-semibold text-gray-900">
              What do you want to share publicly?
            </Label>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Calorie Data</p>
                  <p className="text-sm text-gray-600">Share your daily calorie intake</p>
                </div>
                <Switch
                  checked={data.share_calories}
                  onCheckedChange={(checked) => onUpdate({ share_calories: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Macro Data</p>
                  <p className="text-sm text-gray-600">Share protein, carbs, and fats</p>
                </div>
                <Switch
                  checked={data.share_macros}
                  onCheckedChange={(checked) => onUpdate({ share_macros: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Goals</p>
                  <p className="text-sm text-gray-600">Share your weight and fitness goals</p>
                </div>
                <Switch
                  checked={data.share_goals}
                  onCheckedChange={(checked) => onUpdate({ share_goals: checked })}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> You can change these settings anytime from your profile. 
            Your health data is always encrypted and secure.
          </p>
        </div>
      </div>
    </Card>
  );
}