import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/contexts/I18nContext';
import { useNutrition } from '@/contexts/NutritionContext';
import { useUserGoals } from '@/contexts/UserGoalsContext';
import { AddMealModal } from './AddMealModal';
import { Plus, Utensils, Trash2 } from 'lucide-react';

export const NutritionTracker: React.FC = () => {
  const { t } = useI18n();
  const { todaysLogs, dailySummary, loading, deleteFoodLog } = useNutrition();
  const { userGoals } = useUserGoals();
  const [showAddMeal, setShowAddMeal] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">{t('common.loading')}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const targets = {
    calories: userGoals?.target_calories || 2000,
    protein: userGoals?.target_protein || 150,
    carbs: userGoals?.target_carbs || 250,
    fat: userGoals?.target_fat || 67,
  };

  const current = {
    calories: dailySummary?.total_calories || 0,
    protein: dailySummary?.total_protein || 0,
    carbs: dailySummary?.total_carbs || 0,
    fat: dailySummary?.total_fat || 0,
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const mealsByType = {
    breakfast: todaysLogs.filter(log => log.meal_type === 'breakfast'),
    lunch: todaysLogs.filter(log => log.meal_type === 'lunch'),
    dinner: todaysLogs.filter(log => log.meal_type === 'dinner'),
    snack: todaysLogs.filter(log => log.meal_type === 'snack'),
  };

  return (
    <div className="space-y-6">
      {/* Daily Goals Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            {t('nutrition.daily_goals')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('nutrition.calories')}</span>
              <span>{current.calories} / {targets.calories}</span>
            </div>
            <Progress 
              value={(current.calories / targets.calories) * 100} 
              className="h-3"
            />
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-center">{t('nutrition.protein')}</div>
              <div className="text-center">
                <div className="text-lg font-bold">{Math.round(current.protein)}g</div>
                <div className="text-xs text-muted-foreground">/ {targets.protein}g</div>
              </div>
              <Progress 
                value={(current.protein / targets.protein) * 100}
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-center">{t('nutrition.carbs')}</div>
              <div className="text-center">
                <div className="text-lg font-bold">{Math.round(current.carbs)}g</div>
                <div className="text-xs text-muted-foreground">/ {targets.carbs}g</div>
              </div>
              <Progress 
                value={(current.carbs / targets.carbs) * 100}
                className="h-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-center">{t('nutrition.fat')}</div>
              <div className="text-center">
                <div className="text-lg font-bold">{Math.round(current.fat)}g</div>
                <div className="text-xs text-muted-foreground">/ {targets.fat}g</div>
              </div>
              <Progress 
                value={(current.fat / targets.fat) * 100}
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals by Type */}
      {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => (
        <Card key={mealType}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg capitalize">
                {t(`nutrition.${mealType}`)}
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowAddMeal(true)}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {mealsByType[mealType].length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                No {mealType} logged yet
              </div>
            ) : (
              <div className="space-y-2">
                {mealsByType[mealType].map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{log.food_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.quantity} {log.unit} • {Math.round(log.calories)} cal
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          P: {Math.round(log.protein)}g
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          C: {Math.round(log.carbs)}g
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          F: {Math.round(log.fat)}g
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => log.id && deleteFoodLog(log.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <AddMealModal
        open={showAddMeal}
        onClose={() => setShowAddMeal(false)}
      />
    </div>
  );
};