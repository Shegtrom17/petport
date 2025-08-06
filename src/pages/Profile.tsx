import { useAuth } from "@/context/AuthContext";
import { PWALayout } from "@/components/PWALayout";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <PWALayout>
      <AppHeader title="Profile" />
      <div className="p-4 space-y-4">
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
      </div>
    </PWALayout>
  );
}