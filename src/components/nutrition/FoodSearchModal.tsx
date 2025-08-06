import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNutrition } from '@/contexts/NutritionContext';
import { useI18n } from '@/contexts/I18nContext';
import { Search, Apple } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FoodSearchModalProps {
  children: React.ReactNode;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

// Sample food database for demo purposes
const sampleFoods = [
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, per: '100g' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, per: '100g' },
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, per: '100g' },
  { name: 'Rice (cooked)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, per: '100g' },
  { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, per: '100g' },
  { name: 'Salmon', calories: 208, protein: 25, carbs: 0, fat: 12, per: '100g' },
  { name: 'Oats', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, per: '100g' },
  { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, per: '100g' },
];

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({ children, mealType }) => {
  const { addFoodLog } = useNutrition();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<typeof sampleFoods[0] | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');

  const filteredFoods = sampleFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFood = async () => {
    if (!selectedFood) return;

    const multiplier = parseFloat(quantity) / 100; // Convert to per 100g base

    await addFoodLog({
      date: new Date().toISOString().split('T')[0],
      meal_type: mealType,
      food_name: selectedFood.name,
      quantity: parseFloat(quantity),
      unit,
      calories: selectedFood.calories * multiplier,
      protein: selectedFood.protein * multiplier,
      carbs: selectedFood.carbs * multiplier,
      fat: selectedFood.fat * multiplier,
    });

    setOpen(false);
    setSelectedFood(null);
    setSearchTerm('');
    setQuantity('100');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t('nutrition.search_food')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('nutrition.food_search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {!selectedFood ? (
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredFoods.map((food, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setSelectedFood(food)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{food.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {food.calories} cal per {food.per}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div>P: {food.protein}g</div>
                        <div>C: {food.carbs}g</div>
                        <div>F: {food.fat}g</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredFoods.length === 0 && searchTerm && (
                <div className="text-center py-8 text-muted-foreground">
                  No foods found for "{searchTerm}"
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Apple className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">{selectedFood.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedFood.calories} cal per {selectedFood.per}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-medium">{selectedFood.calories}</div>
                      <div className="text-muted-foreground">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{selectedFood.protein}g</div>
                      <div className="text-muted-foreground">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{selectedFood.carbs}g</div>
                      <div className="text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{selectedFood.fat}g</div>
                      <div className="text-muted-foreground">Fat</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">{t('nutrition.quantity')}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('nutrition.unit')}</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">{t('nutrition.grams')}</SelectItem>
                      <SelectItem value="oz">oz</SelectItem>
                      <SelectItem value="cup">cup</SelectItem>
                      <SelectItem value="piece">piece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFood(null)}
                  className="flex-1"
                >
                  {t('common.back')}
                </Button>
                <Button
                  onClick={handleAddFood}
                  className="flex-1"
                >
                  {t('nutrition.add_to_meal')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};