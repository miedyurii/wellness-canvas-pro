import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Stats {
  totalMeasurements: number;
  currentBMI?: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  averageBMI: number;
  healthyRange: boolean;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('bmi_measurements')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const currentBMI = data[0].bmi;
        const previousBMI = data.length > 1 ? data[1].bmi : currentBMI;
        const avgBMI = data.reduce((sum, m) => sum + m.bmi, 0) / data.length;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        const trendValue = Math.abs(currentBMI - previousBMI);
        
        if (currentBMI > previousBMI + 0.1) trend = 'up';
        else if (currentBMI < previousBMI - 0.1) trend = 'down';

        setStats({
          totalMeasurements: data.length,
          currentBMI,
          trend,
          trendValue,
          averageBMI: Math.round(avgBMI * 10) / 10,
          healthyRange: currentBMI >= 18.5 && currentBMI < 25,
        });
      } else {
        setStats({
          totalMeasurements: 0,
          trend: 'stable',
          trendValue: 0,
          averageBMI: 0,
          healthyRange: false,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-health">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getRecommendation = () => {
    if (!stats?.currentBMI) return "Start tracking your BMI to get personalized recommendations";
    
    if (stats.currentBMI < 18.5) {
      return "Consider consulting a healthcare provider about healthy weight gain strategies";
    } else if (stats.currentBMI >= 18.5 && stats.currentBMI < 25) {
      return "Great! You're in the healthy BMI range. Keep maintaining your current lifestyle";
    } else if (stats.currentBMI >= 25 && stats.currentBMI < 30) {
      return "Consider incorporating more physical activity and a balanced diet";
    } else {
      return "Please consult with a healthcare provider for personalized guidance";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Your health progress overview</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-lg border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current BMI</p>
                      <p className="text-2xl font-bold text-primary">
                        {stats?.currentBMI || '--'}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Trend</p>
                      <div className="flex items-center gap-1">
                        {stats?.trend === 'up' && (
                          <>
                            <TrendingUp className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-500">+{stats.trendValue.toFixed(1)}</span>
                          </>
                        )}
                        {stats?.trend === 'down' && (
                          <>
                            <TrendingDown className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">-{stats.trendValue.toFixed(1)}</span>
                          </>
                        )}
                        {stats?.trend === 'stable' && (
                          <span className="text-sm text-muted-foreground">Stable</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average BMI</p>
                      <p className="text-2xl font-bold">
                        {stats?.averageBMI || '--'}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                      <p className="text-2xl font-bold text-accent">
                        {stats?.totalMeasurements || 0}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Status */}
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg ${
                  stats?.healthyRange 
                    ? 'bg-success/10 border border-success/20' 
                    : 'bg-warning/10 border border-warning/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      stats?.healthyRange ? 'bg-success' : 'bg-warning'
                    }`} />
                    <span className="font-medium">
                      {stats?.healthyRange ? 'Healthy Range' : 'Outside Healthy Range'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Healthy BMI range is 18.5 - 24.9
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle>Health Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm">
                    {getRecommendation()}
                  </p>
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>
                    <strong>Medical Disclaimer:</strong> This app is for informational purposes only. 
                    Always consult with healthcare professionals for medical advice.
                  </p>
                </div>
              </CardContent>
            </Card>

            {stats?.totalMeasurements === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No data to display</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your BMI to see your dashboard come to life
                  </p>
                  <a 
                    href="/" 
                    className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-6"
                  >
                    Calculate BMI
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;