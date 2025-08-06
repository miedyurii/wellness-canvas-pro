import React from 'react';
import { NutritionTracker } from '@/components/NutritionTracker';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useI18n } from '@/contexts/I18nContext';
import { Apple } from 'lucide-react';

const Nutrition = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
            <Apple className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('nutrition.title')}</h1>
            <p className="text-muted-foreground">Track your daily nutrition</p>
          </div>
        </div>

        <NutritionTracker />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Nutrition;