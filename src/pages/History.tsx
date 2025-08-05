import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { History as HistoryIcon, Calendar, TrendingUp, Download, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

interface BMIMeasurement {
  id: string;
  date: string;
  height_cm: number;
  weight_kg: number;
  bmi: number;
  category: string;
  body_fat_percent?: number;
}

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const [measurements, setMeasurements] = useState<BMIMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMeasurements();
    }
  }, [user]);

  const fetchMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('bmi_measurements')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to fetch history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMeasurement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bmi_measurements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMeasurements(measurements.filter(m => m.id !== id));
      toast({
        title: "Measurement deleted",
        description: "The measurement has been removed from your history.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    const csvContent = [
      'Date,Height (cm),Weight (kg),BMI,Category,Body Fat %',
      ...measurements.map(m => 
        `${m.date},${m.height_cm},${m.weight_kg},${m.bmi},${m.category},${m.body_fat_percent || ''}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bmi_history.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your BMI history has been downloaded as CSV.",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'underweight':
        return 'text-underweight';
      case 'normal':
        return 'text-normal';
      case 'overweight':
        return 'text-overweight';
      case 'obese':
        return 'text-obese';
      default:
        return 'text-muted-foreground';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
              <HistoryIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BMI History</h1>
              <p className="text-muted-foreground">Track your progress over time</p>
            </div>
          </div>
          {measurements.length > 0 && (
            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : measurements.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <HistoryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No measurements yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your BMI to see your progress here
              </p>
              <Button asChild>
                <a href="/">Calculate BMI</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {measurements.map((measurement) => (
              <Card key={measurement.id} className="shadow-lg border-primary/10 hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">
                          {new Date(measurement.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {measurement.height_cm}cm • {measurement.weight_kg}kg
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {measurement.bmi}
                      </div>
                      <div className={`text-sm font-medium ${getCategoryColor(measurement.category)}`}>
                        {measurement.category}
                      </div>
                      {measurement.body_fat_percent && (
                        <div className="text-xs text-muted-foreground">
                          {measurement.body_fat_percent}% body fat
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeasurement(measurement.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default History;