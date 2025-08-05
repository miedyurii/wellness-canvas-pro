import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Save, Share } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BMIResult {
  bmi: number;
  category: string;
  categoryColor: string;
  idealWeight: { min: number; max: number };
  bodyFat?: number;
  bmr?: number;
  dailyCalories?: number;
}

export const BMICalculator = () => {
  const { user } = useAuth();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [units, setUnits] = useState('metric');
  const [result, setResult] = useState<BMIResult | null>(null);
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const ageNum = parseInt(age);

    // Basic presence check
    if (!height || !weight) {
      toast({
        title: "Missing information",
        description: "Please enter both height and weight.",
        variant: "destructive",
      });
      return false;
    }

    // Height validation
    if (units === 'metric') {
      if (heightNum < 50 || heightNum > 300) {
        toast({
          title: "Invalid height",
          description: "Height must be between 50-300 cm.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      if (heightNum < 20 || heightNum > 120) {
        toast({
          title: "Invalid height",
          description: "Height must be between 20-120 inches.",
          variant: "destructive",
        });
        return false;
      }
    }

    // Weight validation
    if (units === 'metric') {
      if (weightNum < 1 || weightNum > 1000) {
        toast({
          title: "Invalid weight",
          description: "Weight must be between 1-1000 kg.",
          variant: "destructive",
        });
        return false;
      }
    } else {
      if (weightNum < 2 || weightNum > 2200) {
        toast({
          title: "Invalid weight",
          description: "Weight must be between 2-2200 lbs.",
          variant: "destructive",
        });
        return false;
      }
    }

    // Age validation (if provided)
    if (age && (ageNum < 13 || ageNum > 120)) {
      toast({
        title: "Invalid age",
        description: "Age must be between 13-120 years.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const calculateBMI = () => {
    if (!validateInputs()) return;

    let heightCm = parseFloat(height);
    let weightKg = parseFloat(weight);

    // Convert units if necessary
    if (units === 'imperial') {
      heightCm = heightCm * 2.54; // inches to cm
      weightKg = weightKg * 0.453592; // pounds to kg
    }

    // Calculate BMI
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    // Determine category and color
    let category = '';
    let categoryColor = '';
    
    if (bmi < 18.5) {
      category = 'Underweight';
      categoryColor = 'text-underweight';
    } else if (bmi < 25) {
      category = 'Normal weight';
      categoryColor = 'text-normal';
    } else if (bmi < 30) {
      category = 'Overweight';
      categoryColor = 'text-overweight';
    } else {
      category = 'Obese';
      categoryColor = 'text-obese';
    }

    // Calculate ideal weight range (BMI 18.5-24.9)
    const idealWeightMin = 18.5 * heightM * heightM;
    const idealWeightMax = 24.9 * heightM * heightM;

    // Calculate body fat percentage (Navy method - simplified)
    let bodyFat;
    if (age && gender) {
      if (gender === 'male') {
        bodyFat = 1.20 * bmi + 0.23 * parseInt(age) - 16.2;
      } else {
        bodyFat = 1.20 * bmi + 0.23 * parseInt(age) - 5.4;
      }
      bodyFat = Math.max(0, Math.min(100, bodyFat));
    }

    // Calculate BMR (Mifflin-St Jeor Equation)
    let bmr;
    let dailyCalories;
    if (age && gender) {
      if (gender === 'male') {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) + 5;
      } else {
        bmr = 10 * weightKg + 6.25 * heightCm - 5 * parseInt(age) - 161;
      }
      dailyCalories = bmr * 1.4; // Lightly active
    }

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      categoryColor,
      idealWeight: {
        min: Math.round(idealWeightMin * 10) / 10,
        max: Math.round(idealWeightMax * 10) / 10,
      },
      bodyFat: bodyFat ? Math.round(bodyFat * 10) / 10 : undefined,
      bmr: bmr ? Math.round(bmr) : undefined,
      dailyCalories: dailyCalories ? Math.round(dailyCalories) : undefined,
    });
  };

  const saveMeasurement = async () => {
    if (!user || !result) {
      toast({
        title: "Cannot save",
        description: "Please sign in and calculate your BMI first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const heightCm = units === 'metric' ? parseFloat(height) : parseFloat(height) * 2.54;
      const weightKg = units === 'metric' ? parseFloat(weight) : parseFloat(weight) * 0.453592;

      const { error } = await supabase
        .from('bmi_measurements')
        .insert({
          user_id: user.id,
          height_cm: heightCm,
          weight_kg: weightKg,
          bmi: result.bmi,
          body_fat_percent: result.bodyFat,
          category: result.category.toLowerCase().replace(' ', ''),
          formula: 'standard',
        });

      if (error) throw error;

      toast({
        title: "Measurement saved!",
        description: "Your BMI measurement has been saved to your history.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shareResult = async () => {
    if (!result) return;

    // Security notice for data sharing
    const confirmed = window.confirm(
      "You're about to share your BMI data. This will include your BMI value and category. Continue?"
    );
    
    if (!confirmed) return;

    const shareText = `My BMI is ${result.bmi} (${result.category}). Check out this Health & BMI Tracker app!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My BMI Result',
          text: shareText,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard",
          description: "Your BMI result has been copied to clipboard.",
        });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard",
        description: "Your BMI result has been copied to clipboard.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            BMI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="units">Units</Label>
              <Select value={units} onValueChange={setUnits}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (cm/kg)</SelectItem>
                  <SelectItem value="imperial">Imperial (in/lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">
                Height ({units === 'metric' ? 'cm' : 'inches'})
              </Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={units === 'metric' ? '170' : '67'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">
                Weight ({units === 'metric' ? 'kg' : 'lbs'})
              </Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={units === 'metric' ? '70' : '154'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age (optional)</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender (optional)</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={calculateBMI}
            className="w-full"
            size="lg"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate BMI
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-lg border-primary/20 animate-fade-in">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle>Your Results</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {result.bmi}
              </div>
              <div className={`text-lg font-semibold ${result.categoryColor}`}>
                {result.category}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ideal Weight Range</Label>
                <div className="text-sm text-muted-foreground">
                  {result.idealWeight.min} - {result.idealWeight.max} kg
                </div>
              </div>

              {result.bodyFat && (
                <div className="space-y-2">
                  <Label>Body Fat %</Label>
                  <div className="text-sm text-muted-foreground">
                    {result.bodyFat}%
                  </div>
                </div>
              )}

              {result.bmr && (
                <div className="space-y-2">
                  <Label>BMR</Label>
                  <div className="text-sm text-muted-foreground">
                    {result.bmr} calories/day
                  </div>
                </div>
              )}

              {result.dailyCalories && (
                <div className="space-y-2">
                  <Label>Daily Calories</Label>
                  <div className="text-sm text-muted-foreground">
                    {result.dailyCalories} calories
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={saveMeasurement}
                disabled={loading || !user}
                variant="secondary"
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={shareResult}
                variant="outline"
                className="flex-1"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {!user && (
              <div className="text-sm text-muted-foreground text-center">
                Sign in to save your measurements and track your progress
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};