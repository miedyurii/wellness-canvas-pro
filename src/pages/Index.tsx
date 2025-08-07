import { BMICalculator } from '@/components/BMICalculator';
import { BMIProgressChart } from '@/components/BMIProgressChart';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserGoals } from '@/contexts/UserGoalsContext';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Heart, UserPlus } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { userGoals, loading } = useUserGoals();
  const { t } = useI18n();

  // Show onboarding wizard if user is logged in but hasn't completed onboarding
  if (user && !loading && (!userGoals || !userGoals.onboarding_completed)) {
    return <OnboardingWizard onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Health & BMI Tracker</h1>
              <p className="text-muted-foreground">Track your wellness journey</p>
            </div>
          </div>
          {!user && (
            <Button asChild variant="outline">
              <a href="/auth">
                <UserPlus className="w-4 h-4 mr-2" />
                Sign In
              </a>
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <BMICalculator />
          {user && <BMIProgressChart />}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Index;
