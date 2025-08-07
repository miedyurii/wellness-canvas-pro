import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteAccountRequest {
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { userId }: DeleteAccountRequest = await req.json();
    
    // Ensure user can only delete their own account
    if (user.id !== userId) {
      throw new Error('Unauthorized: Cannot delete another user\'s account');
    }

    console.log(`Starting account deletion for user: ${userId}`);

    // Delete data from all user-related tables in the correct order
    // (respecting foreign key constraints)
    
    const tablesToClean = [
      'nutrition_logs',
      'daily_nutrition_summary', 
      'meal_presets',
      'bmi_measurements',
      'health_goals',
      'milestones',
      'user_preferences',
      'notification_prefs',
      'integrations',
      'user_goals',
      'user_profiles'
    ];

    // Delete data from each table
    for (const table of tablesToClean) {
      try {
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error(`Error deleting from ${table}:`, deleteError);
          // Continue with other tables even if one fails
        } else {
          console.log(`Successfully deleted data from ${table}`);
        }
      } catch (tableError) {
        console.error(`Failed to delete from ${table}:`, tableError);
        // Continue with other tables
      }
    }

    // Finally, delete the user from auth.users
    const { error: userDeleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (userDeleteError) {
      console.error('Error deleting user from auth:', userDeleteError);
      throw new Error('Failed to delete user account');
    }

    console.log(`Successfully deleted user account: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account and all associated data deleted successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
    
  } catch (error: any) {
    console.error('Account deletion error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Account deletion failed',
        success: false 
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);