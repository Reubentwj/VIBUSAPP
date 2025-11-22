import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from '@/api/client'
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

import WelcomeStep from '../components/onboarding/WelcomeStep.jsx';
import PersonalInfoStep from '../components/onboarding/PersonalInfoStep.jsx';
import ActivityGoalsStep from '../components/onboarding/ActivityGoalsStep.jsx';
import PrivacyStep from '../components/onboarding/PrivacyStep.jsx';
import PlanPreviewStep from '../components/onboarding/PlanPreviewStep.jsx';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userData, setUserData] = useState({
    weight_kg: '',
    height_cm: '',
    age: '',
    gender: '',
    activity_level: '',
    goal_type: '',
    goal_aggression: '',
    profile_visibility: 'public',
    share_calories: true,
    share_macros: true,
    share_goals: true,
    bio: '',
    dietary_preferences: []
  });

  const totalSteps = 5;

  const calculatePlan = () => {
    const { weight_kg, height_cm, age, gender, activity_level, goal_type, goal_aggression } = userData;

    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
    } else {
      bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    const tdee = bmr * activityMultipliers[activity_level];

    const aggressionAdjustments = {
      conservative: 250,
      moderate: 400,
      aggressive: 600
    };
    const adjustment = aggressionAdjustments[goal_aggression];

    let daily_calories;
    if (goal_type === 'lose') {
      daily_calories = tdee - adjustment;
    } else if (goal_type === 'gain') {
      daily_calories = tdee + adjustment;
    } else {
      daily_calories = tdee;
    }

    const proteinPercent = goal_type === 'lose' ? 0.325 : 0.275;
    const carbsPercent = goal_type === 'lose' ? 0.425 : goal_type === 'gain' ? 0.5 : 0.475;
    const fatsPercent = goal_type === 'lose' ? 0.275 : 0.25;

    const daily_protein_g = Math.round((daily_calories * proteinPercent) / 4);
    const daily_carbs_g = Math.round((daily_calories * carbsPercent) / 4);
    const daily_fats_g = Math.round((daily_calories * fatsPercent) / 9);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      daily_calories: Math.round(daily_calories),
      daily_protein_g,
      daily_carbs_g,
      daily_fats_g
    };
  };

  const handleNext = () => {
    if (currentStep === 2) {
      const plan = calculatePlan();
      setUserData({ ...userData, ...plan });
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      await client.auth.updateMe({
        ...userData,
        onboarding_completed: true
      });
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
    setIsProcessing(false);
  };

  const updateUserData = (data) => {
    setUserData({ ...userData, ...data });
  };

  const steps = [
    <WelcomeStep key="welcome" onNext={handleNext} />,
    <PersonalInfoStep key="personal" data={userData} onUpdate={updateUserData} />,
    <ActivityGoalsStep key="goals" data={userData} onUpdate={updateUserData} />,
    <PrivacyStep key="privacy" data={userData} onUpdate={updateUserData} />,
    <PlanPreviewStep key="preview" data={userData} onUpdate={updateUserData} />
  ];

  const canProceed = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) {
      return userData.weight_kg && userData.height_cm && userData.age && userData.gender;
    }
    if (currentStep === 2) {
      return userData.activity_level && userData.goal_type && userData.goal_aggression;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="container mx-auto max-w-2xl">
        {currentStep > 0 && (
          <div className="mb-6 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        )}

        {steps[currentStep]}

        {currentStep > 0 && (
          <div className="flex items-center justify-between mt-6 gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              size="lg"
              className="gap-2"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {currentStep < totalSteps && (
              <Button
                onClick={handleNext}
                size="lg"
                disabled={!canProceed() || isProcessing}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 gap-2"
              >
                {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {currentStep === totalSteps && (
              <Button
                onClick={handleComplete}
                size="lg"
                disabled={isProcessing}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Start
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}