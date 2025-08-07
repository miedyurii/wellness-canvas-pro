import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { ProfileSettingsModal } from '@/components/settings/ProfileSettingsModal';
import { NotificationSettingsModal } from '@/components/settings/NotificationSettingsModal';
import { IntegrationSettingsModal } from '@/components/settings/IntegrationSettingsModal';
import { HealthGoalsModal } from '@/components/settings/HealthGoalsModal';
import { PrivacyPolicyModal } from '@/components/settings/PrivacyPolicyModal';
import { TermsOfServiceModal } from '@/components/settings/TermsOfServiceModal';
import { AccountDeletionModal } from '@/components/settings/AccountDeletionModal';
import { MFAModal } from '@/components/settings/MFAModal';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Settings as SettingsIcon, User, Bell, Globe, Shield, Link, ChevronRight, Trash2, Palette } from 'lucide-react';

const Settings = () => {
  const { t, language, setLanguage } = useI18n();
  const { user, signOut } = useAuth();
  const { loading } = useSettings();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const settingsSections = [
    {
      title: t('settings.profile'),
      icon: User,
      items: [
        { 
          label: t('settings.edit_profile'), 
          component: ProfileSettingsModal,
          description: t('settings.personal_info')
        },
        { 
          label: t('settings.health_goals'), 
          component: HealthGoalsModal,
          description: 'Manage your fitness and nutrition goals'
        },
      ]
    },
    {
      title: t('settings.notifications'),
      icon: Bell,
      items: [
        { 
          label: t('settings.notification_settings'), 
          component: NotificationSettingsModal,
          description: 'Manage push, email, and reminder settings'
        },
      ]
    },
    {
      title: t('settings.integrations'),
      icon: Link,
      items: [
        { 
          label: t('settings.integration_settings'), 
          component: IntegrationSettingsModal,
          description: 'Connect with Apple Health, Google Fit, and more'
        },
      ]
    },
    {
      title: t('settings.privacy'),
      icon: Shield,
      items: [
        { 
          label: t('settings.mfa'), 
          component: MFAModal,
          description: t('settings.mfa_description')
        },
        { 
          label: 'Privacy Policy', 
          component: PrivacyPolicyModal,
          description: 'Review our privacy policy and data handling'
        },
        { 
          label: 'Terms of Service', 
          component: TermsOfServiceModal,
          description: 'View terms and conditions of use'
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
            <p className="text-muted-foreground">Manage your app preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Language & Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Language Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <Label className="text-sm font-medium">{t('settings.language')}</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.language_description')}
                  </p>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Русский (Russian)</SelectItem>
                      <SelectItem value="uk">Українська (Ukrainian)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">{t('settings.theme')}</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.theme_description')}
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Sections */}
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const ItemComponent = item.component;
                      return ItemComponent ? (
                        <ItemComponent key={item.label}>
                          <Button
                            variant="ghost"
                            className="w-full justify-between h-auto p-3 group"
                            disabled={loading}
                          >
                            <div className="text-left flex-1">
                              <div className="font-medium">{item.label}</div>
                              {item.description && (
                                <div className="text-sm text-muted-foreground mt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </Button>
                        </ItemComponent>
                       ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Account Actions */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Signed in as: {user.email}
                  </div>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="w-full"
                      disabled={loading}
                    >
                      Sign Out
                    </Button>
                    <AccountDeletionModal>
                      <Button 
                        variant="destructive" 
                        className="w-full gap-2"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('settings.delete_account')}
                      </Button>
                    </AccountDeletionModal>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* App Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  Wellness App v1.0.0
                </div>
                <div className="text-xs text-muted-foreground">
                  Built with ❤️ for your health journey
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Settings;