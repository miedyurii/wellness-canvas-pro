import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/contexts/I18nContext';
import { useNutrition, NutritionLog } from '@/contexts/NutritionContext';

interface AddMealModalProps {
  open: boolean;
  onClose: () => void;
}

// Simple food database for demo - in real app this would be from external API
const SAMPLE_FOODS = [
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, per: '100g' },
  { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, per: '100g' },
  { name: 'Broccoli', calories: 25, protein: 3, carbs: 5, fat: 0.3, per: '100g' },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, per: '100g' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, per: '100g' },
  { name: 'Oatmeal', calories: 68, protein: 2.4, carbs: 12, fat: 1.4, per: '100g' },
  { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, per: '100g' },
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, per: '100g' },
  { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, per: '100g' },
  { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, per: '100g' },
];

export const AddMealModal: React.FC<AddMealModalProps> = ({ open, onClose }) => {
  const { t } = useI18n();
  const { addFoodLog } = useNutrition();
  
  const [formData, setFormData] = useState({
    meal_type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    food_name: '',
    quantity: 1,
    unit: 'serving',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<typeof SAMPLE_FOODS[0] | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredFoods = SAMPLE_FOODS.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFoodSelect = (food: typeof SAMPLE_FOODS[0]) => {
    setSelectedFood(food);
    setFormData({
      ...formData,
      food_name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    });
  };

  const handleQuantityChange = (quantity: number) => {
    if (!selectedFood) return;
    
    setFormData({
      ...formData,
      quantity,
      calories: (selectedFood.calories * quantity),
      protein: (selectedFood.protein * quantity),
      carbs: (selectedFood.carbs * quantity),
      fat: (selectedFood.fat * quantity),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.food_name || formData.calories === 0) return;

    setLoading(true);
    try {
      await addFoodLog({
        ...formData,
        date: new Date().toISOString().split('T')[0],
      });
      
      // Reset form
      setFormData({
        meal_type: 'breakfast',
        food_name: '',
        quantity: 1,
        unit: 'serving',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      setSearchTerm('');
      setSelectedFood(null);
      onClose();
    } catch (error) {
      console.error('Error adding meal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('nutrition.add_meal')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meal Type */}
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select 
              value={formData.meal_type} 
              onValueChange={(value) => setFormData({ ...formData, meal_type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">{t('nutrition.breakfast')}</SelectItem>
                <SelectItem value="lunch">{t('nutrition.lunch')}</SelectItem>
                <SelectItem value="dinner">{t('nutrition.dinner')}</SelectItem>
                <SelectItem value="snack">{t('nutrition.snack')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Food Search */}
          <div className="space-y-2">
            <Label>{t('nutrition.food_search')}</Label>
            <Input
              placeholder="Type to search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {searchTerm && (
              <div className="max-h-40 overflow-y-auto border rounded-md">
                {filteredFoods.map((food, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full p-2 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                    onClick={() => handleFoodSelect(food)}
                  >
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {food.calories} cal per {food.per}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Food Details */}
          {selectedFood && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
              <div className="font-medium">{selectedFood.name}</div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('nutrition.quantity')}</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 1)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{t('nutrition.unit')}</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serving">Serving</SelectItem>
                      <SelectItem value="gram">Grams</SelectItem>
                      <SelectItem value="cup">Cups</SelectItem>
                      <SelectItem value="piece">Pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nutrition Preview */}
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <div className="font-medium">{Math.round(formData.calories)}</div>
                  <div className="text-muted-foreground">cal</div>
                </div>
                <div>
                  <div className="font-medium">{Math.round(formData.protein)}g</div>
                  <div className="text-muted-foreground">protein</div>
                </div>
                <div>
                  <div className="font-medium">{Math.round(formData.carbs)}g</div>
                  <div className="text-muted-foreground">carbs</div>
                </div>
                <div>
                  <div className="font-medium">{Math.round(formData.fat)}g</div>
                  <div className="text-muted-foreground">fat</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedFood || loading}
            >
              {loading ? t('common.loading') : t('nutrition.add_meal')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};