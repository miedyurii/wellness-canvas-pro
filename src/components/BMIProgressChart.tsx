import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface BMIMeasurement {
  id: string;
  bmi: number;
  date: string;
  weight_kg: number;
}

interface ChartData {
  date: string;
  bmi: number;
  weight: number;
  displayDate: string;
}

export const BMIProgressChart: React.FC = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');

  useEffect(() => {
    if (user) {
      fetchBMIData();
    }
  }, [user]);

  const fetchBMIData = async () => {
    try {
      const { data: measurements, error } = await supabase
        .from('bmi_measurements')
        .select('id, bmi, date, weight_kg')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(7);

      if (error) throw error;

      if (measurements && measurements.length > 0) {
        const chartData = measurements
          .reverse()
          .map((m: BMIMeasurement) => ({
            date: m.date,
            bmi: Number(m.bmi),
            weight: Number(m.weight_kg),
            displayDate: format(new Date(m.date), 'MMM dd'),
          }));

        setData(chartData);
        
        // Calculate trend
        if (chartData.length >= 2) {
          const latest = chartData[chartData.length - 1].bmi;
          const previous = chartData[chartData.length - 2].bmi;
          const diff = latest - previous;
          
          if (Math.abs(diff) < 0.1) {
            setTrend('stable');
          } else if (diff > 0) {
            setTrend('up');
          } else {
            setTrend('down');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching BMI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-red-500';
      case 'down':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return '#3b82f6'; // blue for underweight
    if (bmi < 25) return '#10b981'; // green for normal
    if (bmi < 30) return '#f59e0b'; // yellow for overweight
    return '#ef4444'; // red for obese
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('bmi.progress_chart')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('bmi.progress_chart')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-muted-foreground">{t('bmi.no_data')}</p>
            <p className="text-sm text-muted-foreground">{t('bmi.add_first_measurement')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('bmi.progress_chart')}</span>
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-normal">
              {data.length > 1 && (
                <>
                  {data[data.length - 1].bmi.toFixed(1)} 
                  <span className="text-xs ml-1">BMI</span>
                </>
              )}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="displayDate"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{label}</p>
                        <div className="space-y-1 text-xs">
                          <p className="flex items-center gap-1">
                            <span style={{ color: getBMIColor(data.bmi) }}>●</span>
                            BMI: {data.bmi.toFixed(1)}
                          </p>
                          <p className="text-muted-foreground">
                            Weight: {data.weight.toFixed(1)} kg
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="bmi"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--primary))" }}
                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t('bmi.last_7_measurements')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};