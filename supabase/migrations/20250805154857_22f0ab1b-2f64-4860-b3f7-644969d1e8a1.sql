-- Goals and targets tracking
CREATE TABLE public.health_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('bmi', 'weight', 'body_fat', 'muscle_mass')),
  target_value NUMERIC NOT NULL CHECK (target_value > 0),
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for health_goals
CREATE POLICY "Users can view their own goals" 
ON public.health_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" 
ON public.health_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.health_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.health_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Milestone achievements
CREATE TABLE public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('weight_loss', 'bmi_target', 'consistency', 'streak')),
  achievement_name TEXT NOT NULL,
  metric_value NUMERIC,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  badge_color TEXT DEFAULT 'primary'
);

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for milestones
CREATE POLICY "Users can view their own milestones" 
ON public.milestones 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones" 
ON public.milestones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Health benchmark reference data (public read-only)
CREATE TABLE public.health_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  age_range TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  bmi_p25 NUMERIC NOT NULL,
  bmi_p50 NUMERIC NOT NULL,
  bmi_p75 NUMERIC NOT NULL,
  healthy_range_min NUMERIC NOT NULL,
  healthy_range_max NUMERIC NOT NULL
);

-- Enable RLS but allow public read
ALTER TABLE public.health_benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benchmarks are publicly readable" 
ON public.health_benchmarks 
FOR SELECT 
USING (true);

-- User visualization preferences
CREATE TABLE public.user_preferences (
  user_id UUID NOT NULL PRIMARY KEY,
  preferred_timeframe TEXT NOT NULL DEFAULT '30d' CHECK (preferred_timeframe IN ('7d', '30d', '90d', '1y')),
  default_metrics TEXT[] NOT NULL DEFAULT ARRAY['bmi', 'weight'],
  chart_theme TEXT NOT NULL DEFAULT 'default' CHECK (chart_theme IN ('default', 'dark', 'colorful')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_health_goals_updated_at
BEFORE UPDATE ON public.health_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample benchmark data
INSERT INTO public.health_benchmarks (age_range, gender, bmi_p25, bmi_p50, bmi_p75, healthy_range_min, healthy_range_max) VALUES
('18-24', 'male', 21.5, 23.8, 26.2, 18.5, 24.9),
('18-24', 'female', 20.3, 22.7, 25.8, 18.5, 24.9),
('25-34', 'male', 22.1, 24.9, 27.8, 18.5, 24.9),
('25-34', 'female', 21.0, 23.6, 27.1, 18.5, 24.9),
('35-44', 'male', 22.8, 25.8, 29.0, 18.5, 24.9),
('35-44', 'female', 21.8, 24.8, 28.9, 18.5, 24.9),
('45-54', 'male', 23.3, 26.4, 29.8, 18.5, 24.9),
('45-54', 'female', 22.5, 25.7, 30.1, 18.5, 24.9),
('55-64', 'male', 23.6, 26.8, 30.2, 18.5, 24.9),
('55-64', 'female', 23.1, 26.3, 30.8, 18.5, 24.9),
('65+', 'male', 23.1, 26.1, 29.5, 18.5, 24.9),
('65+', 'female', 22.8, 25.9, 30.3, 18.5, 24.9);