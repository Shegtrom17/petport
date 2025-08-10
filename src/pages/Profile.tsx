import { useAuth } from "@/context/AuthContext";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PWAInstallCard } from "@/components/PWAInstallCard";
import { useNavigate } from "react-router-dom";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useUserSettings } from "@/hooks/useUserSettings";
import { User, LogOut } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useUserSettings(user?.id);
  const navigate = useNavigate();
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
      <AppHeader title="Profile" />
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
            <CardTitle>Billing & Cancellation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You can cancel anytime from the Customer Portal. Your plan stays active until the end of your current billing cycle. No prorated refunds.
            </p>
            <a href="/terms#cancellation" className="text-sm underline">Read full cancellation policy</a>
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
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Home button destination</Label>
                <p className="text-xs text-muted-foreground">Choose where the bottom Home tab goes</p>
              </div>
              <Select
                value={settings.homeDestination}
                onValueChange={(val) => updateSettings({ homeDestination: val as 'app' | 'profile' })}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="app">My Pet (App)</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                </SelectContent>
              </Select>
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