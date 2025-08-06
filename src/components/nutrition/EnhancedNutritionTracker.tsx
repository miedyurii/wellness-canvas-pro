import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNutrition } from '@/contexts/NutritionContext';
import { useI18n } from '@/contexts/I18nContext';
import { FoodSearchModal } from './FoodSearchModal';
import { MealPresetsModal } from './MealPresetsModal';
import { AddMealModal } from '../AddMealModal';
import { NutritionDashboard } from './NutritionDashboard';
import { Plus, Search, Utensils, Zap, QrCode, Trash2 } from 'lucide-react';

const mealTypes = [
  { key: 'breakfast' as const, icon: '🌅' },
  { key: 'lunch' as const, icon: '☀️' },
  { key: 'dinner' as const, icon: '🌙' },
  { key: 'snack' as const, icon: '🍎' },
];

export const EnhancedNutritionTracker: React.FC = () => {
  const { todaysLogs, deleteFoodLog, loading } = useNutrition();
  const { t } = useI18n();
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');

  const getMealLogs = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    return todaysLogs.filter(log => log.meal_type === mealType);
  };

  const getMealTotals = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const logs = getMealLogs(mealType);
    return logs.reduce(
      (totals, log) => ({
        calories: totals.calories + log.calories,
        protein: totals.protein + log.protein,
        carbs: totals.carbs + log.carbs,
        fat: totals.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const handleDeleteFood = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this food item?')) {
      await deleteFoodLog(id);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="meals">Meals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <NutritionDashboard />
        </TabsContent>
        
        <TabsContent value="meals" className="space-y-6">
          {/* Meal Sections */}
          {mealTypes.map((meal) => {
            const logs = getMealLogs(meal.key);
            const totals = getMealTotals(meal.key);
            
            return (
              <Card key={meal.key} className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{meal.icon}</span>
                      <span className="capitalize">{t(`nutrition.${meal.key}`)}</span>
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(totals.calories)} cal
                    </div>
                  </div>
                  {totals.calories > 0 && (
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>P: {Math.round(totals.protein)}g</div>
                      <div>C: {Math.round(totals.carbs)}g</div>
                      <div>F: {Math.round(totals.fat)}g</div>
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Food Items */}
                  {logs.length > 0 ? (
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium">{log.food_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {log.quantity} {log.unit} • {Math.round(log.calories)} cal
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right text-xs">
                              <div>P: {Math.round(log.protein)}g</div>
                              <div>C: {Math.round(log.carbs)}g</div>
                              <div>F: {Math.round(log.fat)}g</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFood(log.id!)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No food logged for {meal.key}</p>
                    </div>
                  )}
                  
                  {/* Add Food Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-3 border-t">
                    <FoodSearchModal mealType={meal.key}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Search className="w-4 h-4 mr-1" />
                        {t('nutrition.search_food')}
                      </Button>
                    </FoodSearchModal>
                    
                    <MealPresetsModal mealType={meal.key}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Utensils className="w-4 h-4 mr-1" />
                        {t('nutrition.saved_meals')}
                      </Button>
                    </MealPresetsModal>
                    
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      <QrCode className="w-4 h-4 mr-1" />
                      {t('nutrition.scan_barcode')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};