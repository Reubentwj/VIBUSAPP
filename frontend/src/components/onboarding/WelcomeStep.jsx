import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WelcomeStep({ onNext }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <Card className="bg-white/90 backdrop-blur-lg border-2 border-gray-200 p-8 lg:p-12 shadow-2xl">
        <div className="mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl mb-6 shadow-xl">
            <Target className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Welcome to Vibus
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your diet and stay healthy
          </p>
        </div>

        <Button
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
        >
          Get Started
        </Button>
      </Card>
    </motion.div>
  );
}