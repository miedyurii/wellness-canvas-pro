import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserGoals } from '@/contexts/UserGoalsContext';
import { useI18n } from '@/contexts/I18nContext';
import { Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HealthGoalsModalProps {
  children: React.ReactNode;
}

export const HealthGoalsModal: React.FC<HealthGoalsModalProps> = ({ children }) => {
  const { userGoals, updateGoals, loading } = useUserGoals();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    target_calories: userGoals?.target_calories?.toString() || '',
    target_protein: userGoals?.target_protein?.toString() || '',
    activity_level: userGoals?.activity_level || 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    fitness_goal: userGoals?.fitness_goal || 'maintain' as 'weight_loss' | 'muscle_gain' | 'maintain' | 'endurance',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGoals({
        target_calories: formData.target_calories ? Number(formData.target_calories) : undefined,
        target_protein: formData.target_protein ? Number(formData.target_protein) : undefined,
        activity_level: formData.activity_level as any,
        fitness_goal: formData.fitness_goal as any,
      });
      setOpen(false);
      toast({
        title: t('common.success'),
        description: 'Health goals updated successfully',
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Failed to update health goals',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {t('settings.health_goals')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="fitness_goal">Fitness Goal</Label>
              <Select 
                value={formData.fitness_goal} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, fitness_goal: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="maintain">Maintain Weight</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target_calories">Target Calories</Label>
              <Input
                id="target_calories"
                type="number"
                value={formData.target_calories}
                onChange={(e) => setFormData(prev => ({ ...prev, target_calories: e.target.value }))}
                placeholder="Enter target calories"
              />
            </div>

            <div>
              <Label htmlFor="target_protein">Target Protein (g)</Label>
              <Input
                id="target_protein"
                type="number"
                value={formData.target_protein}
                onChange={(e) => setFormData(prev => ({ ...prev, target_protein: e.target.value }))}
                placeholder="Enter target protein"
              />
            </div>

            <div>
              <Label htmlFor="activity_level">Activity Level</Label>
              <Select 
                value={formData.activity_level} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, activity_level: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Activity</SelectItem>
                  <SelectItem value="moderate">Moderate Activity</SelectItem>
                  <SelectItem value="active">Very Active</SelectItem>
                  <SelectItem value="very_active">Extra Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};