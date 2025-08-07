import React from 'react';
import { EnhancedNutritionTracker } from '@/components/nutrition/EnhancedNutritionTracker';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Apple } from 'lucide-react';

const Nutrition = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-20">
            <Apple className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nutrition Tracker</h2>
            <p className="text-muted-foreground mb-6">Sign in to track your daily nutrition and meals</p>
            <Navigate to="/auth" replace />
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <EnhancedNutritionTracker />
      <BottomNavigation />
    </div>
  );
};

export default Nutrition;