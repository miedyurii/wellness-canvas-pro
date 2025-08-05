import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Plus, Calendar, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  goal_type: string;
  target_value: number;
  target_date: string | null;
  created_at: string;
  is_active: boolean;
  updated_at: string;
  user_id: string;
}

interface GoalTrackerProps {
  measurements: any[];
}

export const GoalTracker = ({ measurements }: GoalTrackerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [goalType, setGoalType] = useState<'bmi' | 'weight' | 'body_fat' | 'muscle_mass'>('bmi');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async () => {
    if (!targetValue || isNaN(Number(targetValue))) {
      toast({
        title: "Invalid target value",
        description: "Please enter a valid number for your target.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('health_goals')
        .insert({
          user_id: user?.id,
          goal_type: goalType,
          target_value: Number(targetValue),
          target_date: targetDate || null,
        });

      if (error) throw error;

      toast({
        title: "Goal created!",
        description: "Your new health goal has been set successfully.",
      });

      setDialogOpen(false);
      setTargetValue('');
      setTargetDate('');
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error creating goal",
        description: "There was a problem creating your goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const calculateProgress = (goal: Goal) => {
    if (measurements.length === 0) return { progress: 0, current: 0, status: 'no-data' };

    const latest = measurements[measurements.length - 1];
    let current = 0;
    let initial = 0;

    switch (goal.goal_type) {
      case 'bmi':
        current = latest.bmi;
        initial = measurements[0]?.bmi || current;
        break;
      case 'weight':
        current = latest.weight_kg;
        initial = measurements[0]?.weight_kg || current;
        break;
      case 'body_fat':
        current = latest.body_fat_percent || 0;
        initial = measurements[0]?.body_fat_percent || current;
        break;
    }

    const target = goal.target_value;
    const totalChange = target - initial;
    const currentChange = current - initial;
    
    let progress = 0;
    if (totalChange !== 0) {
      progress = Math.abs(currentChange / totalChange) * 100;
    }

    // Determine status
    let status = 'in-progress';
    if (Math.abs(current - target) <= 0.1) {
      status = 'achieved';
    } else if (goal.target_date) {
      const targetDate = new Date(goal.target_date);
      const now = new Date();
      if (now > targetDate) {
        status = 'overdue';
      }
    }

    return { progress: Math.min(progress, 100), current, status };
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'bmi': return 'BMI';
      case 'weight': return 'Weight (kg)';
      case 'body_fat': return 'Body Fat %';
      case 'muscle_mass': return 'Muscle Mass';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'achieved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Achieved</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case 'no-data':
        return <Badge variant="outline">No Data</Badge>;
      default:
        return <Badge variant="outline"><TrendingUp className="w-3 h-3 mr-1" />In Progress</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6" />
            Health Goals
          </h2>
          <p className="text-muted-foreground">Set and track your health targets</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Health Goal</DialogTitle>
              <DialogDescription>
                Set a target for your health metrics and track your progress.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal-type">Goal Type</Label>
                <Select value={goalType} onValueChange={(value: any) => setGoalType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bmi">BMI</SelectItem>
                    <SelectItem value="weight">Weight (kg)</SelectItem>
                    <SelectItem value="body_fat">Body Fat %</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target-value">Target Value</Label>
                <Input
                  id="target-value"
                  type="number"
                  step="0.1"
                  placeholder="Enter target value"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="target-date">Target Date (Optional)</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={createGoal} disabled={isCreating} className="flex-1">
                  {isCreating ? "Creating..." : "Create Goal"}
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-muted rounded animate-pulse mb-4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-20">
            <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Goals Set</h3>
            <p className="text-muted-foreground mb-6">
              Create your first health goal to start tracking your progress
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const { progress, current, status } = calculateProgress(goal);
            
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getGoalTypeLabel(goal.goal_type)} Goal
                    </CardTitle>
                    {getStatusBadge(status)}
                  </div>
                  <CardDescription>
                    Target: {goal.target_value} {goal.goal_type === 'weight' ? 'kg' : goal.goal_type === 'body_fat' ? '%' : ''}
                    {goal.target_date && (
                      <span className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(goal.target_date).toLocaleDateString()}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Current: {current.toFixed(1)}</span>
                      <span>Target: {goal.target_value}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};