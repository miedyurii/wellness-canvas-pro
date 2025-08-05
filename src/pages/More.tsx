import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  MoreHorizontal, 
  Info, 
  Shield, 
  FileText, 
  Heart, 
  Globe, 
  Download,
  Moon,
  Sun,
  Languages
} from 'lucide-react';
import { useTheme } from 'next-themes';

const More = () => {
  const { theme, setTheme } = useTheme();

  const menuItems = [
    {
      icon: Info,
      title: 'About',
      description: 'Learn more about this app',
      action: () => {
        // Could navigate to about page
      }
    },
    {
      icon: FileText,
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      action: () => {
        // Could navigate to terms page
      }
    },
    {
      icon: Shield,
      title: 'Privacy Policy',
      description: 'Your privacy matters to us',
      action: () => {
        // Could navigate to privacy page
      }
    },
    {
      icon: Download,
      title: 'Install App',
      description: 'Add to your home screen',
      action: () => {
        // PWA install prompt
        if ('beforeinstallprompt' in window) {
          // Handle PWA install
        }
      }
    },
    {
      icon: Languages,
      title: 'Language',
      description: 'English (coming: Russian)',
      action: () => {
        // Language selection
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
            <MoreHorizontal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">More</h1>
            <p className="text-muted-foreground">Settings and information</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2" />
                      Dark
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card className="shadow-lg border-primary/20">
            <CardContent className="p-0">
              {menuItems.map((item, index) => (
                <div key={index} className="border-b last:border-b-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto p-4 rounded-none"
                    onClick={item.action}
                  >
                    <item.icon className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Medical Disclaimer */}
          <Card className="shadow-lg border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <Heart className="w-5 h-5" />
                Medical Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This app is for informational purposes only and should not be considered 
                as medical advice. BMI calculations are general indicators and may not 
                apply to all individuals. Always consult with qualified healthcare 
                professionals for medical guidance, diagnosis, and treatment.
              </p>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card className="shadow-lg border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-2xl">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Health & BMI Tracker</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your personal health companion for tracking BMI and wellness goals
              </p>
              <div className="text-xs text-muted-foreground">
                Version 1.0.0 • Made with ❤️ for your health
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default More;