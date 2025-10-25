import { useAuth } from "@/context/AuthContext";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PWAInstallCard } from "@/components/PWAInstallCard";
import { useNavigate } from "react-router-dom";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useUserSettings } from "@/hooks/useUserSettings";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";
import { User, LogOut, Mail, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useUserSettings(user?.id);
  const { restartTour } = useOnboardingTour({ hasPets: true });
  const { restartTour: restartLostPetTour } = useOnboardingTour({ hasPets: true, tourType: 'lostPet' });
  const navigate = useNavigate();
  const { toast } = useToast();
  // removed one-time payment state
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

// removed one-time payment handler

  return (
    <PWALayout>
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
    </PWALayout>
  );
}