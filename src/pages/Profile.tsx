import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Settings, Save, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  goal?: string;
}

const Profile = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile(data || {
        id: '',
        first_name: '',
        last_name: '',
        age: undefined,
        gender: '',
        height_cm: undefined,
        goal: '',
      });
    } catch (error: any) {
      toast({
        title: "Failed to fetch profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...profile,
        });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-primary to-secondary rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information</p>
          </div>
        </div>

        {loading ? (
          <Card className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profile?.first_name || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, first_name: e.target.value} : null)}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profile?.last_name || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, last_name: e.target.value} : null)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="13"
                        max="120"
                        value={profile?.age || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, age: parseInt(e.target.value) || undefined} : null)}
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select 
                        value={profile?.gender || ''} 
                        onValueChange={(value) => setProfile(prev => prev ? {...prev, gender: value} : null)}
                      >
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height_cm">Height (cm)</Label>
                      <Input
                        id="height_cm"
                        type="number"
                        min="100"
                        max="250"
                        value={profile?.height_cm || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, height_cm: parseFloat(e.target.value) || undefined} : null)}
                        placeholder="170"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal">Goal</Label>
                      <Select 
                        value={profile?.goal || ''} 
                        onValueChange={(value) => setProfile(prev => prev ? {...prev, goal: value} : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintain">Maintain Weight</SelectItem>
                          <SelectItem value="lose">Lose Weight</SelectItem>
                          <SelectItem value="gain">Gain Weight</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" disabled={saving} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">Email Address</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                
                <Button variant="destructive" onClick={handleSignOut} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Profile;