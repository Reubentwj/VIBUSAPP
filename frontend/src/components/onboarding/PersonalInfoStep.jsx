import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';

export default function PersonalInfoStep({ data, onUpdate }) {
  return (
    <Card className="bg-white/90 backdrop-blur-lg border-2 border-gray-200 p-8 shadow-2xl">
      <div className="mb-6">
        <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Help us understand your body and create a personalized plan</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-base font-semibold">
              Current Weight (kg) *
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={data.weight_kg}
              onChange={(e) => onUpdate({ weight_kg: parseFloat(e.target.value) })}
              className="text-lg p-6 border-2"
              min="40"
              max="300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height" className="text-base font-semibold">
              Height (cm) *
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="175"
              value={data.height_cm}
              onChange={(e) => onUpdate({ height_cm: parseFloat(e.target.value) })}
              className="text-lg p-6 border-2"
              min="120"
              max="250"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="age" className="text-base font-semibold">
              Age *
            </Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={data.age}
              onChange={(e) => onUpdate({ age: parseInt(e.target.value) })}
              className="text-lg p-6 border-2"
              min="13"
              max="120"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-base font-semibold">
              Gender *
            </Label>
            <Select value={data.gender} onValueChange={(value) => onUpdate({ gender: value })}>
              <SelectTrigger className="text-lg p-6 border-2">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This information helps us calculate your basal metabolic rate (BMR) 
            and create accurate nutrition targets tailored to your body.
          </p>
        </div>
      </div>
    </Card>
  );
}