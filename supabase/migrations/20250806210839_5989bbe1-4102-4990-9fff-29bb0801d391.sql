-- Create user_goals table for onboarding preferences
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fitness_goal TEXT NOT NULL, -- 'weight_loss', 'muscle_gain', 'maintain', 'endurance'
  workout_style TEXT NOT NULL, -- 'cardio', 'strength', 'yoga', 'mixed'
  dietary_restrictions TEXT[], -- array of restrictions like 'vegetarian', 'gluten_free', etc.
  activity_level TEXT NOT NULL DEFAULT 'moderate', -- 'sedentary', 'light', 'moderate', 'active', 'very_active'
  target_calories INTEGER,
  target_protein NUMERIC,
  target_carbs NUMERIC,
  target_fat NUMERIC,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_goals
CREATE POLICY "Users can view their own goals" 
ON public.user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.user_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create nutrition_logs table
CREATE TABLE public.nutrition_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  food_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'serving', -- 'serving', 'gram', 'cup', etc.
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  fiber NUMERIC DEFAULT 0,
  sugar NUMERIC DEFAULT 0,
  sodium NUMERIC DEFAULT 0,
  external_food_id TEXT, -- for API integration later
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for nutrition_logs
CREATE POLICY "Users can view their own nutrition logs" 
ON public.nutrition_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own nutrition logs" 
ON public.nutrition_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition logs" 
ON public.nutrition_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition logs" 
ON public.nutrition_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create daily_nutrition_summary table for quick daily totals
CREATE TABLE public.daily_nutrition_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_calories NUMERIC NOT NULL DEFAULT 0,
  total_protein NUMERIC NOT NULL DEFAULT 0,
  total_carbs NUMERIC NOT NULL DEFAULT 0,
  total_fat NUMERIC NOT NULL DEFAULT 0,
  total_fiber NUMERIC DEFAULT 0,
  total_sugar NUMERIC DEFAULT 0,
  total_sodium NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_nutrition_summary ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_nutrition_summary
CREATE POLICY "Users can view their own daily summaries" 
ON public.daily_nutrition_summary 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily summaries" 
ON public.daily_nutrition_summary 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily summaries" 
ON public.daily_nutrition_summary 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_goals_updated_at
BEFORE UPDATE ON public.user_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nutrition_logs_updated_at
BEFORE UPDATE ON public.nutrition_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_nutrition_summary_updated_at
BEFORE UPDATE ON public.daily_nutrition_summary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);
CREATE INDEX idx_nutrition_logs_user_date ON public.nutrition_logs(user_id, date);
CREATE INDEX idx_daily_nutrition_summary_user_date ON public.daily_nutrition_summary(user_id, date);