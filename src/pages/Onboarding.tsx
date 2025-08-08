import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { featureFlags } from "@/config/featureFlags";
import { MetaTags } from "@/components/MetaTags";
export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [type, setType] = useState<'individual' | 'organization' | ''>('');
  const [orgName, setOrgName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !type) return;
    if (type === 'organization' && !orgName.trim()) {
      toast({ variant: 'destructive', title: 'Organization name required' });
      return;
    }
    setSubmitting(true);
    try {
      // Update profile account_type
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ account_type: type })
        .eq('id', user.id);
      if (pErr) throw pErr;

      // If org, create organization owned by this user
      if (type === 'organization') {
        const { error: oErr } = await supabase
          .from('organizations')
          .insert({ name: orgName.trim(), owner_id: user.id });
        if (oErr) throw oErr;
      }

      toast({ title: 'Onboarding complete' });
      navigate('/app');
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Failed to complete onboarding' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <MetaTags title="Onboarding | PetPort" description="Choose Individual or Organization. Fosters can transfer to adopters without an org." url={window.location.href} />
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Welcome! Choose your account type</CardTitle>
          <p className="text-sm text-muted-foreground">
            Individual = pet owners and independent fosters. Organization = rescue/shelter teams. You can transfer to adopters either way.
          </p>
          {featureFlags.testMode && (
            <p className="text-sm text-muted-foreground">Test Mode active — you can skip this step anytime.</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <RadioGroup value={type} onValueChange={(v) => setType(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="ind" />
                <Label htmlFor="ind">Individual (pet owner or independent foster)</Label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="organization" id="org" />
                <Label htmlFor="org">Rescue / Organization team</Label>
              </div>
            </RadioGroup>

            {type === 'organization' && (
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization name</Label>
                <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Happy Tails Rescue" />
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting || !type}>
                {submitting ? 'Saving...' : 'Continue'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/app')}>Skip</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
