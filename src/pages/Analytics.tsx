import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNavigation } from '@/components/BottomNavigation';
import { AdvancedChart } from '@/components/AdvancedChart';
import { GoalTracker } from '@/components/GoalTracker';
import { HealthInsights } from '@/components/HealthInsights';
import { BenchmarkComparison } from '@/components/BenchmarkComparison';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, TrendingUp, Target, BarChart3, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type TimeFrame = '7d' | '30d' | '90d' | '1y';

const Analytics = () => {
  const { user } = useAuth();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('30d');
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, timeFrame]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const days = timeFrame === '7d' ? 7 : timeFrame === '30d' ? 30 : timeFrame === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('bmi_measurements')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-20">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
            <p className="text-muted-foreground mb-6">Sign in to view your health analytics and insights</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Health Analytics</h1>
              <p className="text-muted-foreground">Track your progress and insights</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <AdvancedChart 
              data={measurements}
              timeFrame={timeFrame}
              onTimeFrameChange={setTimeFrame}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalTracker measurements={measurements} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <HealthInsights measurements={measurements} timeFrame={timeFrame} />
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            <BenchmarkComparison measurements={measurements} />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Analytics;