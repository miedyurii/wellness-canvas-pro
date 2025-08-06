export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bmi_measurements: {
        Row: {
          bmi: number
          body_fat_percent: number | null
          category: string
          created_at: string
          date: string
          formula: string
          height_cm: number
          id: string
          notes: string | null
          updated_at: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          bmi: number
          body_fat_percent?: number | null
          category: string
          created_at?: string
          date?: string
          formula?: string
          height_cm: number
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          bmi?: number
          body_fat_percent?: number | null
          category?: string
          created_at?: string
          date?: string
          formula?: string
          height_cm?: number
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      daily_nutrition_summary: {
        Row: {
          created_at: string
          date: string
          id: string
          total_calories: number
          total_carbs: number
          total_fat: number
          total_fiber: number | null
          total_protein: number
          total_sodium: number | null
          total_sugar: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_fiber?: number | null
          total_protein?: number
          total_sodium?: number | null
          total_sugar?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_fiber?: number | null
          total_protein?: number
          total_sodium?: number | null
          total_sugar?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_benchmarks: {
        Row: {
          age_range: string
          bmi_p25: number
          bmi_p50: number
          bmi_p75: number
          gender: string
          healthy_range_max: number
          healthy_range_min: number
          id: string
        }
        Insert: {
          age_range: string
          bmi_p25: number
          bmi_p50: number
          bmi_p75: number
          gender: string
          healthy_range_max: number
          healthy_range_min: number
          id?: string
        }
        Update: {
          age_range?: string
          bmi_p25?: number
          bmi_p50?: number
          bmi_p75?: number
          gender?: string
          healthy_range_max?: number
          healthy_range_min?: number
          id?: string
        }
        Relationships: []
      }
      health_goals: {
        Row: {
          created_at: string
          goal_type: string
          id: string
          is_active: boolean
          target_date: string | null
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_type: string
          id?: string
          is_active?: boolean
          target_date?: string | null
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_type?: string
          id?: string
          is_active?: boolean
          target_date?: string | null
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          achieved_at: string
          achievement_name: string
          badge_color: string | null
          id: string
          metric_value: number | null
          milestone_type: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          achievement_name: string
          badge_color?: string | null
          id?: string
          metric_value?: number | null
          milestone_type: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          achievement_name?: string
          badge_color?: string | null
          id?: string
          metric_value?: number | null
          milestone_type?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_logs: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          date: string
          external_food_id: string | null
          fat: number
          fiber: number | null
          food_name: string
          id: string
          meal_type: string
          protein: number
          quantity: number
          sodium: number | null
          sugar: number | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calories: number
          carbs?: number
          created_at?: string
          date?: string
          external_food_id?: string | null
          fat?: number
          fiber?: number | null
          food_name: string
          id?: string
          meal_type: string
          protein?: number
          quantity?: number
          sodium?: number | null
          sugar?: number | null
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          date?: string
          external_food_id?: string | null
          fat?: number
          fiber?: number | null
          food_name?: string
          id?: string
          meal_type?: string
          protein?: number
          quantity?: number
          sodium?: number | null
          sugar?: number | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          activity_level: string
          created_at: string
          dietary_restrictions: string[] | null
          fitness_goal: string
          id: string
          onboarding_completed: boolean
          target_calories: number | null
          target_carbs: number | null
          target_fat: number | null
          target_protein: number | null
          updated_at: string
          user_id: string
          workout_style: string
        }
        Insert: {
          activity_level?: string
          created_at?: string
          dietary_restrictions?: string[] | null
          fitness_goal: string
          id?: string
          onboarding_completed?: boolean
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          updated_at?: string
          user_id: string
          workout_style: string
        }
        Update: {
          activity_level?: string
          created_at?: string
          dietary_restrictions?: string[] | null
          fitness_goal?: string
          id?: string
          onboarding_completed?: boolean
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          updated_at?: string
          user_id?: string
          workout_style?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          chart_theme: string
          created_at: string
          default_metrics: string[]
          preferred_timeframe: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chart_theme?: string
          created_at?: string
          default_metrics?: string[]
          preferred_timeframe?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chart_theme?: string
          created_at?: string
          default_metrics?: string[]
          preferred_timeframe?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string
          email: string | null
          first_name: string | null
          gender: string | null
          goal: string | null
          height_cm: number | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
