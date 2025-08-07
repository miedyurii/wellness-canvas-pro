-- Add missing DELETE policies for security

-- Fix daily_nutrition_summary DELETE policy
CREATE POLICY "Users can delete their own daily summaries" 
ON public.daily_nutrition_summary 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix integrations DELETE policy  
CREATE POLICY "Users can delete their own integrations" 
ON public.integrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix notification_prefs DELETE policy
CREATE POLICY "Users can delete their own notification preferences" 
ON public.notification_prefs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Fix user_preferences DELETE policy
CREATE POLICY "Users can delete their own preferences" 
ON public.user_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add input validation constraints for security
ALTER TABLE public.user_profiles 
ADD CONSTRAINT first_name_length CHECK (char_length(first_name) <= 50),
ADD CONSTRAINT last_name_length CHECK (char_length(last_name) <= 50),
ADD CONSTRAINT age_range CHECK (age > 0 AND age <= 150),
ADD CONSTRAINT height_range CHECK (height_cm > 0 AND height_cm <= 300);

ALTER TABLE public.bmi_measurements
ADD CONSTRAINT weight_range CHECK (weight_kg > 0 AND weight_kg <= 1000),
ADD CONSTRAINT height_range CHECK (height_cm > 0 AND height_cm <= 300),
ADD CONSTRAINT notes_length CHECK (char_length(notes) <= 500);

ALTER TABLE public.nutrition_logs
ADD CONSTRAINT food_name_length CHECK (char_length(food_name) <= 200),
ADD CONSTRAINT quantity_positive CHECK (quantity > 0),
ADD CONSTRAINT calories_positive CHECK (calories >= 0);

ALTER TABLE public.meal_presets
ADD CONSTRAINT preset_name_length CHECK (char_length(name) <= 100);