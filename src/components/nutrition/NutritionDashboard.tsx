import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNutrition } from '@/contexts/NutritionContext';
import { useUserGoals } from '@/contexts/UserGoalsContext';
import { useI18n } from '@/contexts/I18nContext';
import { Utensils, Target, TrendingUp } from 'lucide-react';

export const NutritionDashboard: React.FC = () => {
  const { dailySummary } = useNutrition();
  const { userGoals } = useUserGoals();
  const { t } = useI18n();

  const targetCalories = userGoals?.target_calories || 2000;
  const targetProtein = userGoals?.target_protein || 150;
  const targetCarbs = userGoals?.target_carbs || 250;
  const targetFat = userGoals?.target_fat || 65;

  const caloriesProgress = dailySummary ? (dailySummary.total_calories / targetCalories) * 100 : 0;
  const proteinProgress = dailySummary ? (dailySummary.total_protein / targetProtein) * 100 : 0;
  const carbsProgress = dailySummary ? (dailySummary.total_carbs / targetCarbs) * 100 : 0;
  const fatProgress = dailySummary ? (dailySummary.total_fat / targetFat) * 100 : 0;

  const macros = [
    {
      name: t('nutrition.protein'),
      current: dailySummary?.total_protein || 0,
      target: targetProtein,
      progress: proteinProgress,
      color: 'hsl(var(--primary))',
      unit: 'g',
    },
    {
      name: t('nutrition.carbs'),
      current: dailySummary?.total_carbs || 0,
      target: targetCarbs,
      progress: carbsProgress,
      color: 'hsl(var(--secondary))',
      unit: 'g',
    },
    {
      name: t('nutrition.fat'),
      current: dailySummary?.total_fat || 0,
      target: targetFat,
      progress: fatProgress,
      color: 'hsl(var(--accent))',
      unit: 'g',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Calories Overview */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t('nutrition.daily_goals')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(dailySummary?.total_calories || 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                of {targetCalories} {t('nutrition.calories')}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('nutrition.calories')}</span>
                <span>
                  {Math.round(dailySummary?.total_calories || 0)} / {targetCalories}
                </span>
              </div>
              <Progress value={Math.min(caloriesProgress, 100)} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {targetCalories - Math.round(dailySummary?.total_calories || 0) > 0 
                  ? `${targetCalories - Math.round(dailySummary?.total_calories || 0)} ${t('nutrition.remaining')}`
                  : `${Math.round(dailySummary?.total_calories || 0) - targetCalories} ${t('nutrition.exceeded')}`
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macros Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('nutrition.macros_breakdown')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {macros.map((macro) => (
              <div key={macro.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{macro.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(macro.current)}{macro.unit} / {macro.target}{macro.unit}
                  </span>
                </div>
                <Progress 
                  value={Math.min(macro.progress, 100)} 
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  {Math.round(macro.progress)}% of daily goal
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Nutrients */}
      {(dailySummary?.total_fiber || dailySummary?.total_sugar || dailySummary?.total_sodium) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Additional Nutrients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {dailySummary?.total_fiber && (
                <div>
                  <div className="text-lg font-semibold">
                    {Math.round(dailySummary.total_fiber)}g
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('nutrition.fiber')}
                  </div>
                </div>
              )}
              {dailySummary?.total_sugar && (
                <div>
                  <div className="text-lg font-semibold">
                    {Math.round(dailySummary.total_sugar)}g
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('nutrition.sugar')}
                  </div>
                </div>
              )}
              {dailySummary?.total_sodium && (
                <div>
                  <div className="text-lg font-semibold">
                    {Math.round(dailySummary.total_sodium)}mg
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('nutrition.sodium')}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};