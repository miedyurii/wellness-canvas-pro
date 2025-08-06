import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNutrition } from '@/contexts/NutritionContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Utensils, Plus } from 'lucide-react';

interface MealPreset {
  id: string;
  name: string;
  meal_type: string;
  foods: any[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

interface MealPresetsModalProps {
  children: React.ReactNode;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export const MealPresetsModal: React.FC<MealPresetsModalProps> = ({ children, mealType }) => {
  const { addFoodLog } = useNutrition();
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [presets, setPresets] = useState<MealPreset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchPresets();
    }
  }, [open, user]);

  const fetchPresets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meal_presets')
        .select('*')
        .eq('user_id', user.id)
        .eq('meal_type', mealType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresets((data || []) as MealPreset[]);
    } catch (error) {
      console.error('Error fetching meal presets:', error);
      toast({
        title: "Error",
        description: "Failed to load saved meals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPreset = async (preset: MealPreset) => {
    try {
      // Add each food in the preset to today's log
      for (const food of preset.foods) {
        await addFoodLog({
          date: new Date().toISOString().split('T')[0],
          meal_type: mealType,
          food_name: food.food_name,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        });
      }

      toast({
        title: "Success",
        description: `Added ${preset.name} to ${mealType}`,
      });
      setOpen(false);
    } catch (error) {
      console.error('Error adding preset:', error);
      toast({
        title: "Error",
        description: "Failed to add saved meal",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            {t('nutrition.saved_meals')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : presets.length > 0 ? (
            presets.map((preset) => (
              <Card key={preset.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{preset.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(preset.total_calories)} cal
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                    <div>P: {Math.round(preset.total_protein)}g</div>
                    <div>C: {Math.round(preset.total_carbs)}g</div>
                    <div>F: {Math.round(preset.total_fat)}g</div>
                  </div>

                  <div className="text-xs text-muted-foreground mb-3">
                    {preset.foods.length} item{preset.foods.length !== 1 ? 's' : ''}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAddPreset(preset)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('nutrition.add_to_meal')}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No saved meals for {mealType}</p>
              <p className="text-sm">Save your favorite meals to add them quickly next time</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};