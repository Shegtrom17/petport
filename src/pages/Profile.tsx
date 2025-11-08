import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PWAInstallCard } from "@/components/PWAInstallCard";
import { useNavigate } from "react-router-dom";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useUserSettings } from "@/hooks/useUserSettings";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
import { User, LogOut, Mail, RotateCw, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MetaTags } from "@/components/MetaTags";
import { GuardianManagementModal } from "@/components/GuardianManagementModal";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useUserSettings(user?.id);
  const { restartTour } = useOnboardingTour({ hasPets: true });
  const { restartTour: restartLostPetTour } = useOnboardingTour({ hasPets: true, tourType: 'lostPet' });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guardianModalOpen, setGuardianModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<{ id: string; name: string } | null>(null);
  const [userPets, setUserPets] = useState<any[]>([]);
  const [guardianCounts, setGuardianCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user?.id) {
      fetchUserPets();
    }
  }, [user?.id]);

  const fetchUserPets = async () => {
    if (!user?.id) return;

    const { data: pets } = await supabase
      .from("pets")
      .select("id, name")
      .eq("user_id", user.id);

    if (pets) {
      setUserPets(pets);
      
      // Fetch guardian counts for each pet
      const counts: Record<string, number> = {};
      for (const pet of pets) {
        const { count } = await supabase
          .from("pet_guardians")
          .select("*", { count: "exact", head: true })
          .eq("pet_id", pet.id);
        counts[pet.id] = count || 0;
      }
      setGuardianCounts(counts);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const openGuardianModal = (petId: string, petName: string) => {
    setSelectedPet({ id: petId, name: petName });
    setGuardianModalOpen(true);
  };

// removed one-time payment handler

  return (
    <PWALayout>
      <MetaTags
        title="Profile - PetPort"
        description="Manage your PetPort account settings and preferences"
        url={typeof window !== 'undefined' ? window.location.href : 'https://petport.app/profile'}
        noindex={true}
      />
      <AppHeader title="Profile" showHelpIcon />
      <div className="p-4 space-y-4">
        {/* PWA Install Card */}
        <PWAInstallCard />

        {user && (
          <div>
            <Button 
              variant="outline"
              onClick={() => navigate('/billing')}
            >
              Open Billing & Add-ons
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Billing & Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You can cancel anytime from the Customer Portal. Your plan stays active until the end of your current billing cycle. No prorated refunds.
            </p>
            <div className="flex gap-3 text-sm">
              <a href="/terms#cancellation" className="underline text-muted-foreground hover:text-foreground">Cancellation policy</a>
              <span className="text-muted-foreground">•</span>
              <a href="/data-deletion" className="underline text-muted-foreground hover:text-foreground">Delete account</a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user?.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-foreground">{user.email}</p>
                
                <Alert className="mt-3 bg-blue-50/80 border-blue-200">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-xs text-blue-700">
                    <strong>Relay Messages:</strong> When someone uses "Contact Owner" 
                    on your pet's public pages (Lost Pet, Profile, etc.), their messages 
                    are securely delivered to this email. Your email address is never 
                    exposed publicly. <a href="/help" className="underline">Learn more</a>
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </CardContent>
        </Card>

        {/* Pet Guardian & Legacy Planning */}
        {user && userPets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Pet Guardian & Legacy Planning
              </CardTitle>
              <CardDescription>
                Designate a trusted person to care for your pets in case of emergency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {userPets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{pet.name}</p>
                      {guardianCounts[pet.id] > 0 ? (
                        <Badge variant="secondary" className="mt-1">
                          Guardian Assigned
                        </Badge>
                      ) : (
                        <p className="text-sm text-muted-foreground">No guardian set</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openGuardianModal(pet.id, pet.name)}
                  >
                    {guardianCounts[pet.id] > 0 ? "Manage" : "Set Up"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="pb-4 border-b">
              <div className="flex items-center gap-2 mb-2">
                <RotateCw className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Getting Started Tours</Label>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Restart the guided tours to learn about key features
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={() => {
                    toast({
                      title: "🔄 Starting Main App Tour",
                      description: "Navigating to home page...",
                      duration: 2000,
                    });
                    navigate('/app');
                    setTimeout(() => restartTour(), 300);
                  }} 
                  variant="outline" 
                  size="sm"
                >
                  🔄 Main App Tour
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: "🚨 Starting Lost Pet Tour",
                      description: "Navigating to Quick ID tab...",
                      duration: 2000,
                    });
                    navigate('/app?tab=quickid');
                    setTimeout(() => restartLostPetTour(), 500);
                  }} 
                  variant="outline" 
                  size="sm"
                >
                  🚨 Lost Pet Tour
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Remember last tab</Label>
                <p className="text-xs text-muted-foreground">Open the last tab you used on this device</p>
              </div>
              <Switch
                checked={settings.rememberLastTab}
                onCheckedChange={(checked) => updateSettings({ rememberLastTab: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedPet && (
        <GuardianManagementModal
          isOpen={guardianModalOpen}
          onClose={() => {
            setGuardianModalOpen(false);
            fetchUserPets(); // Refresh counts
          }}
          petId={selectedPet.id}
          petName={selectedPet.name}
        />
      )}
    </PWALayout>
  );
}