import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/lib/supabase";

interface ProfileData {
  id: string;
  full_name: string;
  monthly_budget: number | null;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { user, updateEmail, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Load profile data on mount
  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.uid)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          if (error.code !== 'PGRST116') { // PGRST116 = no rows found
            toast({ title: "Error", description: "Could not load profile data" });
          }
          return;
        }

        if (data) {
          setFullName(data.full_name || "");
          setMonthlyBudget(data.monthly_budget ? String(data.monthly_budget) : "");
        }
      } catch (err: any) {
        console.error('Unexpected error loading profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user, toast]);

  const onUpdateEmail = async () => {
    if (!email) return toast({ title: "Email required", description: "Please enter an email" });
    setLoading(true);
    try {
      await updateEmail(email);
      toast({ title: "Email updated", description: "Your email has been updated successfully" });
    } catch (e: any) {
      toast({ title: "Failed to update", description: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePassword = async () => {
    if (!password || password.length < 6) return toast({ title: "Invalid password", description: "Password must be at least 6 characters" });
    if (password !== confirmPassword) return toast({ title: "Mismatch", description: "Passwords do not match" });
    setLoading(true);
    try {
      await updatePassword(password);
      setPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated", description: "Your password was updated" });
    } catch (e: any) {
      toast({ title: "Failed to update", description: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  };

  const onUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const budget = monthlyBudget ? parseFloat(monthlyBudget) : null;
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.uid,
          full_name: fullName,
          monthly_budget: budget,
        });

      if (error) throw error;
      toast({ title: "Profile updated", description: "Your profile has been updated successfully" });
    } catch (e: any) {
      console.error('Error updating profile:', e);
      toast({ title: "Failed to update", description: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground">You need to be signed in to view your profile.</p>
          <div className="mt-6">
            <Button onClick={() => navigate('/login')}>Sign in</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-16 text-foreground">
          <h1 className="text-3xl font-bold text-foreground mb-6">Your Profile</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-card/5 p-6 border border-border">
              <h2 className="font-semibold text-lg mb-3">Personal Information</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="mt-2" />
                </div>
                <div>
                  <Label>Monthly Budget (₹)</Label>
                  <Input value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} type="number" placeholder="Enter your monthly budget" className="mt-2" />
                </div>
                <div className="mt-4">
                  <Button onClick={onUpdateProfile} disabled={loading || profileLoading}>
                    {profileLoading ? "Loading..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-card/5 p-6 border border-border">
              <h2 className="font-semibold text-lg mb-3">Account details</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>UID</Label>
                  <Input value={user.uid} disabled className="mt-2" />
                </div>
                <div className="mt-4">
                  <Button onClick={onUpdateEmail} disabled={loading}>
                    Update Email
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-card/5 p-6 border border-border md:col-span-2">
              <h2 className="font-semibold text-lg mb-3">Change password</h2>
              <div className="grid md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                <div>
                  <Label>New password</Label>
                  <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2" />
                </div>
                <div>
                  <Label>Confirm password</Label>
                  <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="mt-2" />
                </div>
                <div className="flex items-end">
                  <Button onClick={onUpdatePassword} disabled={loading} className="w-full">
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
