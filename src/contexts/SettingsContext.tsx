import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

export interface NotificationPrefs {
  id?: string;
  user_id: string;
  onesignal_player_id?: string;
  push_notifications: boolean;
  email_notifications: boolean;
  workout_reminders: boolean;
  nutrition_reminders: boolean;
}

export interface Integrations {
  id?: string;
  user_id: string;
  apple_health_enabled: boolean;
  google_fit_enabled: boolean;
  fitness_tracker_enabled: boolean;
}

export interface UserProfile {
  id?: string;
  user_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
}

interface SettingsContextType {
  notificationPrefs: NotificationPrefs | null;
  integrations: Integrations | null;
  userProfile: UserProfile | null;
  loading: boolean;
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => Promise<void>;
  updateIntegrations: (integrations: Partial<Integrations>) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs | null>(null);
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      refreshSettings();
    } else {
      setNotificationPrefs(null);
      setIntegrations(null);
      setUserProfile(null);
      setLoading(false);
    }
  }, [user]);

  const refreshSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch notification preferences
      const { data: notifPrefs, error: notifError } = await supabase
        .from('notification_prefs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (notifError && notifError.code !== 'PGRST116') throw notifError;

      // Create default notification preferences if none exist
      if (!notifPrefs) {
        const { data: newNotifPrefs, error: createNotifError } = await supabase
          .from('notification_prefs')
          .insert({
            user_id: user.id,
            push_notifications: true,
            email_notifications: true,
            workout_reminders: true,
            nutrition_reminders: true,
          })
          .select()
          .single();

        if (createNotifError) throw createNotifError;
        setNotificationPrefs(newNotifPrefs as NotificationPrefs);
      } else {
        setNotificationPrefs(notifPrefs as NotificationPrefs);
      }

      // Fetch integrations
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (integrationsError && integrationsError.code !== 'PGRST116') throw integrationsError;

      // Create default integrations if none exist
      if (!integrationsData) {
        const { data: newIntegrations, error: createIntegrationsError } = await supabase
          .from('integrations')
          .insert({
            user_id: user.id,
            apple_health_enabled: false,
            google_fit_enabled: false,
            fitness_tracker_enabled: false,
          })
          .select()
          .single();

        if (createIntegrationsError) throw createIntegrationsError;
        setIntegrations(newIntegrations as Integrations);
      } else {
        setIntegrations(integrationsData as Integrations);
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (profileData) {
        setUserProfile(profileData as UserProfile);
      }

    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationPrefs = async (prefs: Partial<NotificationPrefs>) => {
    if (!user || !notificationPrefs) return;

    try {
      const { data, error } = await supabase
        .from('notification_prefs')
        .update(prefs)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setNotificationPrefs(data as NotificationPrefs);
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
    }
  };

  const updateIntegrations = async (newIntegrations: Partial<Integrations>) => {
    if (!user || !integrations) return;

    try {
      const { data, error } = await supabase
        .from('integrations')
        .update(newIntegrations)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setIntegrations(data as Integrations);
      toast({
        title: "Success",
        description: "Integration settings updated",
      });
    } catch (error) {
      console.error('Error updating integrations:', error);
      toast({
        title: "Error",
        description: "Failed to update integration settings",
        variant: "destructive",
      });
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profile)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data as UserProfile);
      toast({
        title: "Success",
        description: "Profile updated",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const value = {
    notificationPrefs,
    integrations,
    userProfile,
    loading,
    updateNotificationPrefs,
    updateIntegrations,
    updateUserProfile,
    refreshSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};