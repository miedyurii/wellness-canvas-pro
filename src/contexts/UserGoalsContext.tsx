import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export interface UserGoals {
  id?: string;
  fitness_goal: 'weight_loss' | 'muscle_gain' | 'maintain' | 'endurance';
  workout_style: 'cardio' | 'strength' | 'yoga' | 'mixed';
  dietary_restrictions: string[];
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  onboarding_completed: boolean;
}

interface UserGoalsContextType {
  userGoals: UserGoals | null;
  loading: boolean;
  updateGoals: (goals: Partial<UserGoals>) => Promise<void>;
  completeOnboarding: (goals: UserGoals) => Promise<void>;
  calculateMacros: (profile: any) => { calories: number; protein: number; carbs: number; fat: number };
}

const UserGoalsContext = createContext<UserGoalsContextType | undefined>(undefined);

// Mifflin-St Jeor equation with activity multipliers
const calculateMacros = (profile: any, goals: UserGoals) => {
  if (!profile?.height_cm || !profile?.age || !profile?.gender) {
    return { calories: 2000, protein: 150, carbs: 250, fat: 67 }; // Default values
  }

  // Get latest weight from BMI measurements or profile
  const weightKg = profile.weight_kg || 70; // Default weight if not available
  
  // Mifflin-St Jeor BMR calculation
  let bmr: number;
  if (profile.gender === 'male') {
    bmr = (10 * weightKg) + (6.25 * profile.height_cm) - (5 * profile.age) + 5;
  } else {
    bmr = (10 * weightKg) + (6.25 * profile.height_cm) - (5 * profile.age) - 161;
  }

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  let tdee = bmr * activityMultipliers[goals.activity_level];

  // Adjust for fitness goal
  switch (goals.fitness_goal) {
    case 'weight_loss':
      tdee -= 500; // 500 calorie deficit for 1lb/week loss
      break;
    case 'muscle_gain':
      tdee += 300; // 300 calorie surplus for lean gains
      break;
    case 'maintain':
      // No adjustment
      break;
    case 'endurance':
      tdee += 200; // Slight surplus for endurance training
      break;
  }

  const calories = Math.round(tdee);
  
  // Macro distribution based on fitness goal
  let proteinRatio, carbRatio, fatRatio;
  
  switch (goals.fitness_goal) {
    case 'weight_loss':
      proteinRatio = 0.30; // Higher protein for weight loss
      carbRatio = 0.35;
      fatRatio = 0.35;
      break;
    case 'muscle_gain':
      proteinRatio = 0.25;
      carbRatio = 0.45; // Higher carbs for muscle gain
      fatRatio = 0.30;
      break;
    case 'endurance':
      proteinRatio = 0.20;
      carbRatio = 0.55; // Highest carbs for endurance
      fatRatio = 0.25;
      break;
    default: // maintain
      proteinRatio = 0.25;
      carbRatio = 0.40;
      fatRatio = 0.35;
  }

  const protein = Math.round((calories * proteinRatio) / 4); // 4 cal/g
  const carbs = Math.round((calories * carbRatio) / 4); // 4 cal/g  
  const fat = Math.round((calories * fatRatio) / 9); // 9 cal/g

  return { calories, protein, carbs, fat };
};

export const UserGoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserGoals();
    } else {
      setUserGoals(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setUserGoals(data as UserGoals);
    } catch (error) {
      console.error('Error fetching user goals:', error);
      toast({
        title: "Error",
        description: "Failed to load user goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGoals = async (goals: Partial<UserGoals>) => {
    if (!user || !userGoals) return;

    try {
      const { error } = await supabase
        .from('user_goals')
        .update(goals)
        .eq('user_id', user.id);

      if (error) throw error;

      setUserGoals({ ...userGoals, ...goals });
      toast({
        title: "Success",
        description: "Goals updated successfully",
      });
    } catch (error) {
      console.error('Error updating goals:', error);
      toast({
        title: "Error",
        description: "Failed to update goals",
        variant: "destructive",
      });
    }
  };

  const completeOnboarding = async (goals: UserGoals) => {
    if (!user) return;

    try {
      // Get user profile for macro calculation
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Calculate macros based on profile and goals
      const macros = calculateMacros(profile, goals);
      
      const goalData = {
        ...goals,
        user_id: user.id,
        target_calories: macros.calories,
        target_protein: macros.protein,
        target_carbs: macros.carbs,
        target_fat: macros.fat,
        onboarding_completed: true,
      };

      const { error } = await supabase
        .from('user_goals')
        .upsert(goalData);

      if (error) throw error;

      setUserGoals(goalData);
      toast({
        title: "Welcome!",
        description: "Your wellness journey has begun",
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
        variant: "destructive",
      });
    }
  };

  const value = {
    userGoals,
    loading,
    updateGoals,
    completeOnboarding,
    calculateMacros: (profile: any) => calculateMacros(profile, userGoals || {} as UserGoals),
  };

  return <UserGoalsContext.Provider value={value}>{children}</UserGoalsContext.Provider>;
};

export const useUserGoals = () => {
  const context = useContext(UserGoalsContext);
  if (context === undefined) {
    throw new Error('useUserGoals must be used within a UserGoalsProvider');
  }
  return context;
};