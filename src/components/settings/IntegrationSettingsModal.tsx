import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';
import { useI18n } from '@/contexts/I18nContext';
import { Link, Smartphone, Watch } from 'lucide-react';

interface IntegrationSettingsModalProps {
  children: React.ReactNode;
}

export const IntegrationSettingsModal: React.FC<IntegrationSettingsModalProps> = ({ children }) => {
  const { integrations, updateIntegrations, loading } = useSettings();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const handleToggle = async (key: keyof typeof integrations, value: boolean) => {
    if (!integrations) return;
    await updateIntegrations({ [key]: value });
  };

  if (!integrations) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            {t('settings.integration_settings')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                {t('settings.apple_health')}
              </Label>
              <p className="text-sm text-muted-foreground">
                Sync data with Apple Health app
              </p>
            </div>
            <Switch
              checked={integrations.apple_health_enabled}
              onCheckedChange={(value) => handleToggle('apple_health_enabled', value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                {t('settings.google_fit')}
              </Label>
              <p className="text-sm text-muted-foreground">
                Sync data with Google Fit
              </p>
            </div>
            <Switch
              checked={integrations.google_fit_enabled}
              onCheckedChange={(value) => handleToggle('google_fit_enabled', value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Watch className="w-4 h-4" />
                {t('settings.fitness_trackers')}
              </Label>
              <p className="text-sm text-muted-foreground">
                Connect fitness trackers and wearables
              </p>
            </div>
            <Switch
              checked={integrations.fitness_tracker_enabled}
              onCheckedChange={(value) => handleToggle('fitness_tracker_enabled', value)}
              disabled={loading}
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Integration features are coming soon. Enable them now to be notified when they become available.
            </p>
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