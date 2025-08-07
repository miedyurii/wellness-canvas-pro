import { z } from 'zod';

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  confirmPassword: z.string(),
  firstName: z.string().max(50, 'First name is too long').optional(),
  lastName: z.string().max(50, 'Last name is too long').optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Profile validation schemas
export const profileSchema = z.object({
  first_name: z.string().max(50, 'First name is too long').optional().nullable(),
  last_name: z.string().max(50, 'Last name is too long').optional().nullable(),
  age: z.number().min(1).max(150).optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  height_cm: z.number().min(1).max(300).optional().nullable(),
});

// BMI measurement validation
export const bmiMeasurementSchema = z.object({
  weight_kg: z.number().min(0.1).max(1000),
  height_cm: z.number().min(1).max(300),
  body_fat_percent: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// Nutrition log validation
export const nutritionLogSchema = z.object({
  food_name: z.string().min(1).max(200),
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(1000),
  carbs: z.number().min(0).max(1000),
  fat: z.number().min(0).max(1000),
  quantity: z.number().min(0.01).max(100),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
});

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .trim()
    .substring(0, 1000); // Limit length
};

// Validate and sanitize form data
export const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: any): { 
  success: boolean; 
  data?: T; 
  errors?: string[] 
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.issues.map(issue => issue.message) 
      };
    }
    return { 
      success: false, 
      errors: ['Validation failed'] 
    };
  }
};