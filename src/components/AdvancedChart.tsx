import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type TimeFrame = '7d' | '30d' | '90d' | '1y';
type Metric = 'bmi' | 'weight' | 'body_fat';

interface AdvancedChartProps {
  data: any[];
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
  loading: boolean;
}

export const AdvancedChart = ({ data, timeFrame, onTimeFrameChange, loading }: AdvancedChartProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>(['bmi', 'weight']);

  const timeFrameOptions = [
    { value: '7d' as TimeFrame, label: '7 Days' },
    { value: '30d' as TimeFrame, label: '30 Days' },
    { value: '90d' as TimeFrame, label: '90 Days' },
    { value: '1y' as TimeFrame, label: '1 Year' },
  ];

  const metricOptions = [
    { value: 'bmi' as Metric, label: 'BMI', color: '#8b5cf6' },
    { value: 'weight' as Metric, label: 'Weight (kg)', color: '#06b6d4' },
    { value: 'body_fat' as Metric, label: 'Body Fat %', color: '#f59e0b' },
  ];

  const toggleMetric = (metric: Metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'BMI') return [value?.toFixed(1), name];
    if (name === 'Weight (kg)') return [value?.toFixed(1) + ' kg', name];
    if (name === 'Body Fat %') return [value?.toFixed(1) + '%', name];
    return [value, name];
  };

  const calculateTrend = (metric: Metric) => {
    if (data.length < 2) return null;
    const recent = data.slice(-7);
    const older = data.slice(-14, -7);
    
    if (recent.length === 0 || older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, item) => sum + (item[metric] || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + (item[metric] || 0), 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    return change;
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,BMI,Weight,Body Fat%\n"
      + data.map(item => `${item.date},${item.bmi},${item.weight_kg},${item.body_fat_percent || ''}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `health-analytics-${timeFrame}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Health Trends
            </CardTitle>
            <CardDescription>
              Track your health metrics over time with trend analysis
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportData}
            disabled={data.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {timeFrameOptions.map(option => (
            <Button
              key={option.value}
              variant={timeFrame === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeFrameChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {metricOptions.map(option => (
            <Badge
              key={option.value}
              variant={selectedMetrics.includes(option.value) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleMetric(option.value)}
            >
              <span 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: option.color }}
              />
              {option.label}
              {selectedMetrics.includes(option.value) && (
                <>
                  {(() => {
                    const trend = calculateTrend(option.value);
                    if (trend === null) return null;
                    return (
                      <span className="ml-2 flex items-center">
                        {trend > 0 ? (
                          <TrendingUp className="w-3 h-3 text-red-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-green-500" />
                        )}
                        <span className="ml-1 text-xs">
                          {Math.abs(trend).toFixed(1)}%
                        </span>
                      </span>
                    );
                  })()}
                </>
              )}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Data Available</h3>
            <p className="text-muted-foreground">
              Start tracking your health metrics to see trends and insights
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(value) => format(parseISO(value), 'PPP')}
                  formatter={formatTooltipValue}
                />
                <Legend />
                
                {selectedMetrics.includes('bmi') && (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="bmi" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      name="BMI"
                    />
                    <ReferenceLine y={18.5} stroke="#10b981" strokeDasharray="5 5" />
                    <ReferenceLine y={24.9} stroke="#10b981" strokeDasharray="5 5" />
                    <ReferenceLine y={29.9} stroke="#f59e0b" strokeDasharray="5 5" />
                  </>
                )}
                
                {selectedMetrics.includes('weight') && (
                  <Line 
                    type="monotone" 
                    dataKey="weight_kg" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                    name="Weight (kg)"
                  />
                )}
                
                {selectedMetrics.includes('body_fat') && (
                  <Line 
                    type="monotone" 
                    dataKey="body_fat_percent" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    name="Body Fat %"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};