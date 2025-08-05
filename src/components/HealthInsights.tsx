import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, TrendingDown, Activity, Calendar, Lightbulb } from 'lucide-react';

type TimeFrame = '7d' | '30d' | '90d' | '1y';

interface HealthInsightsProps {
  measurements: any[];
  timeFrame: TimeFrame;
}

export const HealthInsights = ({ measurements, timeFrame }: HealthInsightsProps) => {
  const calculateInsights = () => {
    if (measurements.length < 2) {
      return {
        trends: [],
        patterns: [],
        recommendations: ["Start tracking consistently to unlock personalized insights"]
      };
    }

    const recent = measurements.slice(-7);
    const older = measurements.slice(-14, -7);
    
    const trends = [];
    const patterns = [];
    const recommendations = [];

    // BMI Trend Analysis
    if (recent.length > 0 && older.length > 0) {
      const recentBMI = recent.reduce((sum, m) => sum + m.bmi, 0) / recent.length;
      const olderBMI = older.reduce((sum, m) => sum + m.bmi, 0) / older.length;
      const bmiChange = ((recentBMI - olderBMI) / olderBMI) * 100;

      if (Math.abs(bmiChange) > 0.5) {
        trends.push({
          metric: 'BMI',
          change: bmiChange,
          direction: bmiChange > 0 ? 'increasing' : 'decreasing',
          significance: Math.abs(bmiChange) > 2 ? 'high' : 'moderate'
        });

        if (bmiChange > 1) {
          recommendations.push("Your BMI has been increasing. Consider reviewing your diet and exercise routine.");
        } else if (bmiChange < -1) {
          recommendations.push("Great progress! Your BMI is trending downward. Keep up the good work!");
        }
      }
    }

    // Weight Trend Analysis
    if (recent.length > 0 && older.length > 0) {
      const recentWeight = recent.reduce((sum, m) => sum + m.weight_kg, 0) / recent.length;
      const olderWeight = older.reduce((sum, m) => sum + m.weight_kg, 0) / older.length;
      const weightChange = recentWeight - olderWeight;

      if (Math.abs(weightChange) > 0.5) {
        trends.push({
          metric: 'Weight',
          change: weightChange,
          direction: weightChange > 0 ? 'increasing' : 'decreasing',
          significance: Math.abs(weightChange) > 2 ? 'high' : 'moderate'
        });
      }
    }

    // Consistency Pattern
    const measurementFrequency = measurements.length / getDaysInTimeFrame(timeFrame);
    if (measurementFrequency > 0.8) {
      patterns.push({
        type: 'consistency',
        level: 'excellent',
        description: 'You\'re tracking consistently! This helps identify patterns.'
      });
      recommendations.push("Excellent tracking consistency! This data quality enables accurate insights.");
    } else if (measurementFrequency > 0.5) {
      patterns.push({
        type: 'consistency',
        level: 'good',
        description: 'Good tracking frequency, try to be more consistent for better insights.'
      });
      recommendations.push("Try tracking more regularly for better trend analysis and insights.");
    } else {
      patterns.push({
        type: 'consistency',
        level: 'low',
        description: 'Inconsistent tracking may limit insight accuracy.'
      });
      recommendations.push("More frequent tracking will help provide better insights and trends.");
    }

    // Variation Pattern
    const bmiValues = measurements.map(m => m.bmi);
    const bmiVariation = Math.max(...bmiValues) - Math.min(...bmiValues);
    
    if (bmiVariation < 1) {
      patterns.push({
        type: 'stability',
        level: 'high',
        description: 'Your BMI has been very stable over this period.'
      });
    } else if (bmiVariation < 2) {
      patterns.push({
        type: 'stability',
        level: 'moderate',
        description: 'Your BMI shows moderate variation, which is normal.'
      });
    } else {
      patterns.push({
        type: 'stability',
        level: 'low',
        description: 'Your BMI shows significant variation over this period.'
      });
      recommendations.push("Consider reviewing factors that might cause BMI fluctuations (diet, exercise, stress).");
    }

    // Health Range Analysis
    const latestBMI = measurements[measurements.length - 1]?.bmi;
    if (latestBMI) {
      if (latestBMI >= 18.5 && latestBMI <= 24.9) {
        recommendations.push("Your current BMI is in the healthy range. Maintain your current lifestyle!");
      } else if (latestBMI < 18.5) {
        recommendations.push("Your BMI is below the healthy range. Consider consulting with a healthcare professional.");
      } else if (latestBMI >= 25 && latestBMI < 30) {
        recommendations.push("Your BMI indicates overweight. Small lifestyle changes can help reach a healthier range.");
      } else if (latestBMI >= 30) {
        recommendations.push("Consider consulting with a healthcare professional for personalized guidance.");
      }
    }

    return { trends, patterns, recommendations };
  };

  const getDaysInTimeFrame = (timeFrame: TimeFrame) => {
    switch (timeFrame) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
    }
  };

  const getTrendIcon = (direction: string) => {
    return direction === 'increasing' ? 
      <TrendingUp className="w-4 h-4 text-red-500" /> : 
      <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const getSignificanceBadge = (significance: string) => {
    const variant = significance === 'high' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{significance}</Badge>;
  };

  const getConsistencyColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getConsistencyProgress = (level: string) => {
    switch (level) {
      case 'excellent': return 90;
      case 'good': return 65;
      case 'low': return 30;
      default: return 0;
    }
  };

  const { trends, patterns, recommendations } = calculateInsights();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Brain className="w-6 h-6" />
          Health Insights
        </h2>
        <p className="text-muted-foreground">AI-powered analysis of your health patterns</p>
      </div>

      {measurements.length < 2 ? (
        <Card>
          <CardContent className="text-center py-20">
            <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Insights Coming Soon</h3>
            <p className="text-muted-foreground">
              Add more measurements to unlock personalized health insights and trend analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Trends Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Trends
              </CardTitle>
              <CardDescription>
                Changes detected in your health metrics over the last week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trends.length === 0 ? (
                <p className="text-muted-foreground text-sm">No significant trends detected</p>
              ) : (
                <div className="space-y-3">
                  {trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.direction)}
                        <span className="font-medium">{trend.metric}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {trend.metric === 'Weight' ? 
                            `${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}kg` :
                            `${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%`
                          }
                        </span>
                        {getSignificanceBadge(trend.significance)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patterns Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Behavior Patterns
              </CardTitle>
              <CardDescription>
                Analysis of your tracking consistency and data patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patterns.map((pattern, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{pattern.type}</span>
                      <span className={`text-sm font-medium ${getConsistencyColor(pattern.level)}`}>
                        {pattern.level}
                      </span>
                    </div>
                    {pattern.type === 'consistency' && (
                      <Progress value={getConsistencyProgress(pattern.level)} className="h-2 mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Personalized Recommendations
              </CardTitle>
              <CardDescription>
                Actionable insights based on your health data and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};