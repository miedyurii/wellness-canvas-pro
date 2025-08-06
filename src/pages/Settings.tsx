import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Settings as SettingsIcon, User, Bell, Globe, Shield, Link } from 'lucide-react';

const Settings = () => {
  const { t, language, setLanguage } = useI18n();
  const { user, signOut } = useAuth();

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
        { label: 'Edit Profile', action: () => {} },
        { label: 'Health Goals', action: () => {} },
        { label: 'Personal Information', action: () => {} },
      ]
    },
    {
      title: t('settings.notifications'),
      icon: Bell,
      items: [
        { label: 'Push Notifications', action: () => {} },
        { label: 'Email Notifications', action: () => {} },
        { label: 'Workout Reminders', action: () => {} },
      ]
    },
    {
      title: t('settings.integrations'),
      icon: Link,
      items: [
        { label: 'Apple Health', action: () => {} },
        { label: 'Google Fit', action: () => {} },
        { label: 'Fitness Trackers', action: () => {} },
      ]
    },
    {
      title: t('settings.privacy'),
      icon: Shield,
      items: [
        { label: 'Data & Privacy', action: () => {} },
        { label: 'Account Security', action: () => {} },
        { label: 'Delete Account', action: () => {} },
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
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('settings.language')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language for the app interface
                </p>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский (Russian)</SelectItem>
                  </SelectContent>
                </Select>
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
                    {section.items.map((item) => (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3"
                        onClick={item.action}
                      >
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                        </div>
                      </Button>
                    ))}
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
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    Signed in as: {user.email}
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
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