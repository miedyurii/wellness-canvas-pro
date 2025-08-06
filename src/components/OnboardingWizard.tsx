import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/contexts/I18nContext';
import { useUserGoals, UserGoals } from '@/contexts/UserGoalsContext';
import { Heart, Target, Dumbbell, Apple } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { t } = useI18n();
  const { completeOnboarding } = useUserGoals();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<UserGoals>>({
    fitness_goal: undefined,
    workout_style: undefined,
    dietary_restrictions: [],
    activity_level: 'moderate',
    onboarding_completed: false,
  });

  const fitnessGoals = [
    { value: 'weight_loss', icon: Target },
    { value: 'muscle_gain', icon: Dumbbell },
    { value: 'maintain', icon: Heart },
    { value: 'endurance', icon: Heart },
  ];

  const workoutStyles = [
    { value: 'cardio', icon: Heart },
    { value: 'strength', icon: Dumbbell },
    { value: 'yoga', icon: Heart },
    { value: 'mixed', icon: Target },
  ];

  const dietaryOptions = [
    'vegetarian',
    'vegan', 
    'gluten_free',
    'dairy_free',
    'keto',
    'paleo',
    'none',
  ];

  const activityLevels = [
    'sedentary',
    'light', 
    'moderate',
    'active',
    'very_active',
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!formData.fitness_goal || !formData.workout_style) return;
    
    setLoading(true);
    try {
      await completeOnboarding(formData as UserGoals);
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDietaryRestriction = (restriction: string) => {
    if (restriction === 'none') {
      setFormData({
        ...formData,
        dietary_restrictions: [],
      });
      return;
    }

    const current = formData.dietary_restrictions || [];
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current.filter(r => r !== 'none'), restriction];
    
    setFormData({
      ...formData,
      dietary_restrictions: updated,
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{t('onboarding.step1.title')}</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {fitnessGoals.map((goal) => {
                const Icon = goal.icon;
                const isSelected = formData.fitness_goal === goal.value;
                
                return (
                  <Button
                    key={goal.value}
                    variant={isSelected ? "default" : "outline"}
                    className="h-16 justify-start gap-4"
                    onClick={() => setFormData({ ...formData, fitness_goal: goal.value as any })}
                  >
                    <Icon className="w-6 h-6" />
                    {t(`onboarding.step1.${goal.value}`)}
                  </Button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{t('onboarding.step2.title')}</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {workoutStyles.map((style) => {
                const Icon = style.icon;
                const isSelected = formData.workout_style === style.value;
                
                return (
                  <Button
                    key={style.value}
                    variant={isSelected ? "default" : "outline"}
                    className="h-16 justify-start gap-4"
                    onClick={() => setFormData({ ...formData, workout_style: style.value as any })}
                  >
                    <Icon className="w-6 h-6" />
                    {t(`onboarding.step2.${style.value}`)}
                  </Button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{t('onboarding.step3.title')}</h2>
            </div>
            
            <div className="space-y-3">
              {dietaryOptions.map((option) => {
                const isSelected = formData.dietary_restrictions?.includes(option) || 
                  (option === 'none' && formData.dietary_restrictions?.length === 0);
                
                return (
                  <Button
                    key={option}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full h-12 justify-start"
                    onClick={() => toggleDietaryRestriction(option)}
                  >
                    <Apple className="w-4 h-4 mr-3" />
                    {t(`onboarding.step3.${option}`)}
                  </Button>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">{t('onboarding.activity_level.title')}</h2>
            </div>
            
            <div className="space-y-3">
              {activityLevels.map((level) => {
                const isSelected = formData.activity_level === level;
                
                return (
                  <Button
                    key={level}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full h-16 justify-start text-left"
                    onClick={() => setFormData({ ...formData, activity_level: level as any })}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{t(`onboarding.activity_level.${level}`).split('(')[0]}</span>
                      <span className="text-sm text-muted-foreground">
                        {t(`onboarding.activity_level.${level}`).includes('(') && 
                          `(${t(`onboarding.activity_level.${level}`).split('(')[1]}`}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.fitness_goal;
      case 2:
        return !!formData.workout_style;
      case 3:
        return true; // Dietary restrictions are optional
      case 4:
        return !!formData.activity_level;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold gradient-text">
            {t('onboarding.title')}
          </CardTitle>
          <p className="text-muted-foreground">{t('onboarding.subtitle')}</p>
          
          <div className="flex justify-center space-x-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              {t('common.back')}
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {t('common.next')}
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!isStepValid() || loading}
              >
                {loading ? t('common.loading') : t('common.complete')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};