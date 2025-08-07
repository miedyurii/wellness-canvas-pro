import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';
import { useI18n } from '@/contexts/I18nContext';
import { Bell } from 'lucide-react';

interface NotificationSettingsModalProps {
  children: React.ReactNode;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ children }) => {
  const { notificationPrefs, updateNotificationPrefs, loading } = useSettings();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const handleToggle = async (key: keyof typeof notificationPrefs, value: boolean) => {
    if (!notificationPrefs) return;
    
    // Handle push notification toggle with OneSignal integration
    if (key === 'push_notifications' && value) {
      try {
        // This would integrate with OneSignal to get player_id
        // For now, we'll just update the preference
        await updateNotificationPrefs({ [key]: value });
      } catch (error) {
        console.error('OneSignal integration error:', error);
        await updateNotificationPrefs({ [key]: value });
      }
    } else {
      await updateNotificationPrefs({ [key]: value });
    }
  };

  if (!notificationPrefs) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('settings.notification_settings')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t('settings.push_notifications')}</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on your device
              </p>
            </div>
            <Switch
              checked={notificationPrefs.push_notifications}
              onCheckedChange={(value) => handleToggle('push_notifications', value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t('settings.email_notifications')}</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={notificationPrefs.email_notifications}
              onCheckedChange={(value) => handleToggle('email_notifications', value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t('settings.workout_reminders')}</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about your workout schedule
              </p>
            </div>
            <Switch
              checked={notificationPrefs.workout_reminders}
              onCheckedChange={(value) => handleToggle('workout_reminders', value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t('settings.nutrition_reminders')}</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to log your meals
              </p>
            </div>
            <Switch
              checked={notificationPrefs.nutrition_reminders}
              onCheckedChange={(value) => handleToggle('nutrition_reminders', value)}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setOpen(false)}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};