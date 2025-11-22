import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function MacroRing({ label, current, target, color, unit }) {
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);

  return (
    <Card className="p-3 shadow-md border-2">
      <div className="text-center">
        <p className="text-xs font-semibold text-gray-600 mb-2">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">
          {Math.round(current)}
        </p>
        <p className="text-xs text-gray-500 mb-2">
          / {target}{unit}
        </p>
        <Progress value={percentage} className="h-1.5 mb-2" />
        <p className="text-xs font-medium text-gray-600">
          {Math.round(remaining)}{unit} left
        </p>
      </div>
    </Card>
  );
}