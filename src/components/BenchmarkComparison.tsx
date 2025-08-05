import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Info, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

interface BenchmarkComparisonProps {
  measurements: any[];
}

interface BenchmarkData {
  age_range: string;
  gender: string;
  bmi_p25: number;
  bmi_p50: number;
  bmi_p75: number;
  healthy_range_min: number;
  healthy_range_max: number;
}

export const BenchmarkComparison = ({ measurements }: BenchmarkComparisonProps) => {
  const { user } = useAuth();
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setUserProfile(profile);

      // Fetch benchmarks
      const { data: benchmarkData } = await supabase
        .from('health_benchmarks')
        .select('*')
        .order('age_range');

      setBenchmarks(benchmarkData || []);
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserAgeRange = () => {
    if (!userProfile?.age) return null;
    
    const age = userProfile.age;
    if (age >= 18 && age <= 24) return '18-24';
    if (age >= 25 && age <= 34) return '25-34';
    if (age >= 35 && age <= 44) return '35-44';
    if (age >= 45 && age <= 54) return '45-54';
    if (age >= 55 && age <= 64) return '55-64';
    if (age >= 65) return '65+';
    return null;
  };

  const getUserBenchmark = () => {
    const ageRange = getUserAgeRange();
    const gender = userProfile?.gender?.toLowerCase();
    
    if (!ageRange || !gender) return null;
    
    return benchmarks.find(b => 
      b.age_range === ageRange && 
      b.gender === gender
    );
  };

  const getCurrentBMI = () => {
    if (measurements.length === 0) return null;
    return measurements[measurements.length - 1].bmi;
  };

  const getPercentilePosition = () => {
    const currentBMI = getCurrentBMI();
    const benchmark = getUserBenchmark();
    
    if (!currentBMI || !benchmark) return null;
    
    if (currentBMI <= benchmark.bmi_p25) return { percentile: 25, position: 'bottom' };
    if (currentBMI <= benchmark.bmi_p50) return { percentile: 50, position: 'lower-middle' };
    if (currentBMI <= benchmark.bmi_p75) return { percentile: 75, position: 'upper-middle' };
    return { percentile: 100, position: 'top' };
  };

  const getPositionDescription = (position: string) => {
    switch (position) {
      case 'bottom': return 'Below 25th percentile';
      case 'lower-middle': return '25th-50th percentile';
      case 'upper-middle': return '50th-75th percentile';
      case 'top': return 'Above 75th percentile';
      default: return 'Unknown';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'bottom': return 'bg-blue-500';
      case 'lower-middle': return 'bg-green-500';
      case 'upper-middle': return 'bg-yellow-500';
      case 'top': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const prepareChartData = () => {
    const currentBMI = getCurrentBMI();
    const benchmark = getUserBenchmark();
    
    if (!benchmark) return [];
    
    return [
      { name: '25th Percentile', value: benchmark.bmi_p25, isUser: false },
      { name: '50th Percentile', value: benchmark.bmi_p50, isUser: false },
      { name: '75th Percentile', value: benchmark.bmi_p75, isUser: false },
      { name: 'Your BMI', value: currentBMI || 0, isUser: true },
    ].sort((a, b) => a.value - b.value);
  };

  const getHealthRangeProgress = () => {
    const currentBMI = getCurrentBMI();
    const benchmark = getUserBenchmark();
    
    if (!currentBMI || !benchmark) return 0;
    
    const { healthy_range_min, healthy_range_max } = benchmark;
    
    if (currentBMI < healthy_range_min) {
      return ((currentBMI - 15) / (healthy_range_min - 15)) * 40; // 0-40% for underweight
    } else if (currentBMI >= healthy_range_min && currentBMI <= healthy_range_max) {
      return 40 + ((currentBMI - healthy_range_min) / (healthy_range_max - healthy_range_min)) * 40; // 40-80% for healthy
    } else {
      return 80 + Math.min(((currentBMI - healthy_range_max) / 10) * 20, 20); // 80-100% for overweight+
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const currentBMI = getCurrentBMI();
  const benchmark = getUserBenchmark();
  const percentileData = getPercentilePosition();
  const chartData = prepareChartData();

  if (!currentBMI || !userProfile?.age || !userProfile?.gender) {
    return (
      <Card>
        <CardContent className="text-center py-20">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Comparison Unavailable</h3>
          <p className="text-muted-foreground">
            Add your age and gender in your profile to compare with population benchmarks
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Users className="w-6 h-6" />
          Population Comparison
        </h2>
        <p className="text-muted-foreground">
          See how your BMI compares to others in your demographic
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Percentile Position */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Position
            </CardTitle>
            <CardDescription>
              Compared to {userProfile.gender}s aged {getUserAgeRange()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {percentileData && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{currentBMI.toFixed(1)}</div>
                  <Badge className={getPositionColor(percentileData.position)}>
                    {getPositionDescription(percentileData.position)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Health Range Position</span>
                    <span>{Math.round(getHealthRangeProgress())}%</span>
                  </div>
                  <Progress value={getHealthRangeProgress()} className="h-3">
                    <div className="absolute inset-0 flex">
                      <div className="w-[40%] bg-blue-200" />
                      <div className="w-[40%] bg-green-200" />
                      <div className="w-[20%] bg-red-200" />
                    </div>
                  </Progress>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Underweight</span>
                    <span>Healthy</span>
                    <span>Overweight+</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benchmark Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Population Stats
            </CardTitle>
            <CardDescription>
              BMI distribution for your demographic
            </CardDescription>
          </CardHeader>
          <CardContent>
            {benchmark && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-semibold">{benchmark.bmi_p25}</div>
                    <div className="text-xs text-muted-foreground">25th percentile</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-semibold">{benchmark.bmi_p50}</div>
                    <div className="text-xs text-muted-foreground">Median (50th)</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-semibold">{benchmark.bmi_p75}</div>
                    <div className="text-xs text-muted-foreground">75th percentile</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="text-lg font-semibold">
                      {benchmark.healthy_range_min}-{benchmark.healthy_range_max}
                    </div>
                    <div className="text-xs text-muted-foreground">Healthy range</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>BMI Comparison Chart</CardTitle>
          <CardDescription>
            Your BMI vs population percentiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => [value.toFixed(1), 'BMI']}
                  />
                  <ReferenceLine y={18.5} stroke="#10b981" strokeDasharray="5 5" />
                  <ReferenceLine y={24.9} stroke="#10b981" strokeDasharray="5 5" />
                  <ReferenceLine y={29.9} stroke="#f59e0b" strokeDasharray="5 5" />
                  <Bar dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isUser ? '#8b5cf6' : '#94a3b8'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Population data</strong> is based on health surveys and represents BMI distribution 
                across demographic groups. Individual health goals may vary.
              </p>
              <p>
                <strong>Percentiles</strong> show what percentage of the population has a BMI below yours. 
                Being in a higher percentile doesn't necessarily indicate poor health.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};