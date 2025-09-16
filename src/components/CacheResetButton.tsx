import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { resetAppCache, getCacheStatus } from '@/utils/cacheUtils';
import { featureFlags } from '@/config/featureFlags';

interface CacheResetButtonProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const CacheResetButton = ({ 
  variant = 'outline',
  size = 'sm',
  className = '' 
}: CacheResetButtonProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  // Only show in test mode or development
  if (!featureFlags.testMode && process.env.NODE_ENV === 'production') {
    return null;
  }

  const handleReset = async () => {
    try {
      setIsResetting(true);
      
      // Get cache status before reset
      const beforeStatus = await getCacheStatus();
      console.log('Cache status before reset:', beforeStatus);
      
      // Reset all caches
      await resetAppCache();
      
      toast({
        title: 'Cache Reset Complete',
        description: 'All caches cleared. Page will reload in 2 seconds.',
      });
      
      // Reload page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Cache reset failed:', error);
      toast({
        title: 'Cache Reset Failed',
        description: 'Could not clear all caches. Try refreshing manually.',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Button
      onClick={handleReset}
      disabled={isResetting}
      variant={variant}
      size={size}
      className={`${className}`}
    >
      {isResetting ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4 mr-2" />
      )}
      {isResetting ? 'Resetting...' : 'Reset Cache'}
    </Button>
  );
};