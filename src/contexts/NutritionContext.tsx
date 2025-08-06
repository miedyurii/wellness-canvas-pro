import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export interface NutritionLog {
  id?: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface DailyNutritionSummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber?: number;
  total_sugar?: number;
  total_sodium?: number;
}

interface NutritionContextType {
  todaysLogs: NutritionLog[];
  dailySummary: DailyNutritionSummary | null;
  loading: boolean;
  addFoodLog: (log: Omit<NutritionLog, 'id' | 'user_id'>) => Promise<void>;
  deleteFoodLog: (id: string) => Promise<void>;
  refreshTodaysData: () => Promise<void>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todaysLogs, setTodaysLogs] = useState<NutritionLog[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      refreshTodaysData();
    } else {
      setTodaysLogs([]);
      setDailySummary(null);
      setLoading(false);
    }
  }, [user]);

  const refreshTodaysData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch today's logs
      const { data: logs, error: logsError } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: true });

      if (logsError) throw logsError;

      setTodaysLogs((logs || []) as NutritionLog[]);

      // Calculate daily summary
      const summary = calculateDailySummary((logs || []) as NutritionLog[]);
      setDailySummary(summary);

      // Update or create daily summary in database
      if (logs && logs.length > 0) {
        await upsertDailySummary(summary);
      }
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      toast({
        title: "Error",
        description: "Failed to load nutrition data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDailySummary = (logs: NutritionLog[]): DailyNutritionSummary => {
    return logs.reduce(
      (summary, log) => ({
        date: today,
        total_calories: summary.total_calories + log.calories,
        total_protein: summary.total_protein + log.protein,
        total_carbs: summary.total_carbs + log.carbs,
        total_fat: summary.total_fat + log.fat,
        total_fiber: (summary.total_fiber || 0) + (log.fiber || 0),
        total_sugar: (summary.total_sugar || 0) + (log.sugar || 0),
        total_sodium: (summary.total_sodium || 0) + (log.sodium || 0),
      }),
      {
        date: today,
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        total_fiber: 0,
        total_sugar: 0,
        total_sodium: 0,
      }
    );
  };

  const upsertDailySummary = async (summary: DailyNutritionSummary) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('daily_nutrition_summary')
        .upsert({
          user_id: user.id,
          ...summary,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating daily summary:', error);
    }
  };

  const addFoodLog = async (log: Omit<NutritionLog, 'id' | 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nutrition_logs')
        .insert({
          ...log,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const newLogs = [...todaysLogs, data as NutritionLog];
      setTodaysLogs(newLogs);
      
      const newSummary = calculateDailySummary(newLogs);
      setDailySummary(newSummary);
      
      // Update database summary
      await upsertDailySummary(newSummary);

      toast({
        title: "Success",
        description: `Added ${log.food_name} to ${log.meal_type}`,
      });
    } catch (error) {
      console.error('Error adding food log:', error);
      toast({
        title: "Error",
        description: "Failed to add food",
        variant: "destructive",
      });
    }
  };

  const deleteFoodLog = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('nutrition_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      const newLogs = todaysLogs.filter(log => log.id !== id);
      setTodaysLogs(newLogs);
      
      const newSummary = calculateDailySummary(newLogs);
      setDailySummary(newSummary);
      
      // Update database summary
      await upsertDailySummary(newSummary);

      toast({
        title: "Success",
        description: "Food item removed",
      });
    } catch (error) {
      console.error('Error deleting food log:', error);
      toast({
        title: "Error",
        description: "Failed to delete food item",
        variant: "destructive",
      });
    }
  };

  const value = {
    todaysLogs,
    dailySummary,
    loading,
    addFoodLog,
    deleteFoodLog,
    refreshTodaysData,
  };

  return <NutritionContext.Provider value={value}>{children}</NutritionContext.Provider>;
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};