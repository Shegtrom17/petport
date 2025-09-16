import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Smartphone, Check, Share, Plus, MoreVertical, BookOpen } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export const PWAInstallCard = () => {
  const { 
    isInstalled, 
    isIOS, 
    installNow
  } = usePWAInstall();
  
  const [showInstructions, setShowInstructions] = useState(false);

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(true);
      return;
    }
    const success = await installNow(10000);
    if (!success) {
      setShowInstructions(true);
    }
  };

  const IOSInstructions = () => (
    <div className="space-y-3 text-sm">
      <p className="font-medium">Install on iPhone/iPad:</p>
      <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
        <li className="flex items-center space-x-2">
          <Share className="w-4 h-4 flex-shrink-0" />
          <span>Tap the Share button at the bottom of Safari</span>
        </li>
        <li className="flex items-center space-x-2">
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span>Select "Add to Home Screen"</span>
        </li>
        <li className="flex items-center space-x-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Tap "Add" to install the app</span>
        </li>
      </ol>
    </div>
  );

  const AndroidInstructions = () => (
    <div className="space-y-3 text-sm">
      <p className="font-medium">Install on Android:</p>
      <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
        <li className="flex items-center space-x-2">
          <MoreVertical className="w-4 h-4 flex-shrink-0" />
          <span>Tap the menu (⋮) in your browser</span>
        </li>
        <li className="flex items-center space-x-2">
          <Download className="w-4 h-4 flex-shrink-0" />
          <span>Select "Install app" or "Add to Home screen"</span>
        </li>
        <li className="flex items-center space-x-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Tap "Install" to confirm</span>
        </li>
      </ol>
    </div>
  );

  const AppBenefits = () => (
    <div className="space-y-2 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Benefits of installing:</p>
      <ul className="space-y-1 list-disc list-inside">
        <li>Faster loading and better performance</li>
        <li>Works offline for viewing saved pets</li>
        <li>App-like experience with full screen</li>
        <li>Quick access from your home screen</li>
      </ul>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>App Installation</span>
          </div>
          {isInstalled ? (
            <Badge variant="secondary" className="text-green-600">
              <Check className="w-3 h-3 mr-1" />
              Installed
            </Badge>
          ) : (
            <Badge variant="outline">Available</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isInstalled ? (
          <div className="text-center py-4">
            <Check className="w-12 h-12 mx-auto text-green-600 mb-2" />
            <p className="font-medium">PetPort is installed!</p>
            <p className="text-sm text-muted-foreground">
              You can access the app from your home screen.
            </p>
          </div>
        ) : (
          <>
            {showInstructions ? (
              <div className="space-y-4">
                {isIOS ? <IOSInstructions /> : <AndroidInstructions />}
                <Separator />
                <AppBenefits />
                <Button 
                  variant="outline" 
                  onClick={() => setShowInstructions(false)}
                  className="w-full"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Hide Instructions
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <AppBenefits />
                <Button 
                  onClick={handleInstall}
                  className="w-full bg-brand-primary text-white hover:bg-brand-primary-dark"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isIOS ? "Show Install Instructions" : "Install PetPort App"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};