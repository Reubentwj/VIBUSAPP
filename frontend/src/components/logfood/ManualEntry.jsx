import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function ManualEntry({ onSubmit, isProcessing }) {
  const [formData, setFormData] = useState({
    food_name: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fats_g: '',
    meal_type: 'lunch',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      calories: parseFloat(formData.calories),
      protein_g: parseFloat(formData.protein_g),
      carbs_g: parseFloat(formData.carbs_g),
      fats_g: parseFloat(formData.fats_g)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="food_name">Food Name *</Label>
        <Input
          id="food_name"
          placeholder="e.g., Grilled Chicken Breast"
          value={formData.food_name}
          onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
          required
          className="text-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calories">Calories *</Label>
          <Input
            id="calories"
            type="number"
            placeholder="250"
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="meal_type">Meal Type</Label>
          <Select 
            value={formData.meal_type} 
            onValueChange={(value) => setFormData({ ...formData, meal_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snack">Snack</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="protein">Protein (g) *</Label>
          <Input
            id="protein"
            type="number"
            placeholder="30"
            value={formData.protein_g}
            onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="carbs">Carbs (g) *</Label>
          <Input
            id="carbs"
            type="number"
            placeholder="20"
            value={formData.carbs_g}
            onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
            required
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fats">Fats (g) *</Label>
          <Input
            id="fats"
            type="number"
            placeholder="10"
            value={formData.fats_g}
            onChange={(e) => setFormData({ ...formData, fats_g: e.target.value })}
            required
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional details..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        size="lg"
      >
        {isProcessing ? 'Logging...' : 'Log This Meal'}
      </Button>
    </form>
  );
}