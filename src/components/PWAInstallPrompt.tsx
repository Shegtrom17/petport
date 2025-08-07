import { useState } from 'react';
import { X, Download, Share, Plus, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const PWAInstallPrompt = () => {
  const {
    showPrompt,
    isIOS,
    isInstallable,
    installApp,
    dismissPrompt,
    neverShowAgain
  } = usePWAInstall();
  
  const [showInstructions, setShowInstructions] = useState(false);

  if (!showPrompt) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowInstructions(true);
      return;
    }
    
    const success = await installApp();
    if (!success) {
      setShowInstructions(true);
    }
  };

  const IOSInstructions = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-lg mb-2">Install PetPort App</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get the full app experience on your iPhone
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
            <Share className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <div className="font-medium">1. Tap the Share button</div>
            <div className="text-muted-foreground">At the bottom of your Safari browser</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <div className="font-medium">2. Select "Add to Home Screen"</div>
            <div className="text-muted-foreground">Scroll down if you don't see it</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <div className="font-medium">3. Tap "Add"</div>
            <div className="text-muted-foreground">PetPort will appear on your home screen</div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Button variant="outline" onClick={dismissPrompt} className="flex-1">
          Maybe Later
        </Button>
        <Button 
          variant="ghost" 
          onClick={neverShowAgain}
          className="text-xs px-2"
        >
          Don't Ask Again
        </Button>
      </div>
    </div>
  );

  const AndroidInstructions = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-semibold text-lg mb-2">Install PetPort App</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add PetPort to your home screen for quick access
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
            <Monitor className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <div className="font-medium">1. Open browser menu</div>
            <div className="text-muted-foreground">Tap the three dots (⋮) in your browser</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <div className="font-medium">2. Select "Add to Home Screen"</div>
            <div className="text-muted-foreground">Or "Install App" if available</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <div className="bg-primary/10 p-2 rounded-full flex-shrink-0">
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <div className="text-sm">
            <div className="font-medium">3. Confirm installation</div>
            <div className="text-muted-foreground">PetPort will be added to your home screen</div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Button variant="outline" onClick={dismissPrompt} className="flex-1">
          Maybe Later
        </Button>
        <Button 
          variant="ghost" 
          onClick={neverShowAgain}
          className="text-xs px-2"
        >
          Don't Ask Again
        </Button>
      </div>
    </div>
  );

  if (showInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm mx-auto">
          <CardContent className="p-6">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInstructions(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {isIOS ? <IOSInstructions /> : <AndroidInstructions />}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Install PetPort</h4>
                <p className="text-xs text-muted-foreground">Get the app experience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={dismissPrompt}
              className="h-6 w-6 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleInstall}
              size="sm" 
              className="flex-1 h-8 text-xs"
            >
              {isInstallable && !isIOS ? 'Install' : 'Show How'}
            </Button>
            <Button 
              variant="outline" 
              onClick={dismissPrompt}
              size="sm"
              className="h-8 text-xs px-3"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};