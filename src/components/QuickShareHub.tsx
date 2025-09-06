import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  Shield, 
  FileText, 
  Search, 
  Camera, 
  Star,
  Share2,
  Copy,
  ExternalLink
} from "lucide-react";

interface QuickShareHubProps {
  petData: {
    id?: string;
    name: string;
  };
  isLost: boolean;
}

interface SharePage {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  available: boolean;
  variant: 'default' | 'missing';
}

export const QuickShareHub: React.FC<QuickShareHubProps> = ({ petData, isLost }) => {
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const { toast } = useToast();

  const baseUrl = window.location.origin;

  // Don't render if no pet ID
  if (!petData.id) {
    return null;
  }

  const sharePages: SharePage[] = [
    {
      id: 'profile',
      title: 'Emergency Profile',
      description: 'Complete pet information & contacts',
      icon: <Shield className="w-5 h-5" />,
      path: `/profile/${petData.id}`,
      available: true,
      variant: 'default'
    },
    {
      id: 'care',
      title: 'Care & Handling',
      description: 'Feeding, medical & care instructions',
      icon: <Heart className="w-5 h-5" />,
      path: `/care/${petData.id}`,
      available: true,
      variant: 'default'
    },
    {
      id: 'resume',
      title: 'Pet Resume',
      description: 'Credentials, certifications & achievements',
      icon: <FileText className="w-5 h-5" />,
      path: `/resume/${petData.id}`,
      available: true,
      variant: 'default'
    },
    {
      id: 'missing',
      title: 'Lost Pet Flyer',
      description: 'Missing pet alert with contact info',
      icon: <Search className="w-5 h-5 text-red-600" />,
      path: `/missing-pet/${petData.id}`,
      available: isLost,
      variant: 'missing'
    },
    {
      id: 'gallery',
      title: 'Portrait Gallery',
      description: 'Photo collection & memories',
      icon: <Camera className="w-5 h-5" />,
      path: `/gallery/${petData.id}`,
      available: true,
      variant: 'default'
    },
    {
      id: 'reviews',
      title: 'Reviews & Stories',
      description: 'Community feedback & experiences',
      icon: <Star className="w-5 h-5" />,
      path: `/reviews/${petData.id}`,
      available: true,
      variant: 'default'
    }
  ];

  const handleCopyLink = async (page: SharePage) => {
    setCopyingId(page.id);
    try {
      const fullUrl = `${baseUrl}${page.path}`;
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Link Copied!",
        description: `${page.title} link copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Copy Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setCopyingId(null);
    }
  };

  const handleNativeShare = async (page: SharePage) => {
    const fullUrl = `${baseUrl}${page.path}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${petData.name}'s ${page.title}`,
          text: page.description,
          url: fullUrl,
        });
      } catch (error: any) {
        if (!error?.message?.toLowerCase?.().includes('cancel')) {
          // Fallback to copy
          handleCopyLink(page);
        }
      }
    } else {
      // Fallback to copy for desktop
      handleCopyLink(page);
    }
  };

  const handleOpenLink = (page: SharePage) => {
    const fullUrl = `${baseUrl}${page.path}`;
    window.open(fullUrl, '_blank');
  };

  const availablePages = sharePages.filter(page => page.available);

  return (
    <Card className="bg-white shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Share2 className="w-6 h-6 text-blue-600" />
          Quick Share Hub
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share {petData.name}'s pages with optimized previews for social media
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availablePages.map((page) => (
            <div 
              key={page.id}
              className={`p-4 rounded-lg border ${
                page.variant === 'missing' 
                  ? 'border-red-200 bg-red-50/50' 
                  : 'border-gray-200 bg-gray-50/50'
              } hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {page.icon}
                  <div>
                    <h3 className="font-semibold text-sm">{page.title}</h3>
                    <p className="text-xs text-muted-foreground">{page.description}</p>
                  </div>
                </div>
                {page.variant === 'missing' && (
                  <Badge variant="destructive" className="text-xs">
                    ALERT
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleNativeShare(page)}
                  size="sm"
                  className="flex-1 text-xs"
                  disabled={copyingId === page.id}
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
                
                <Button
                  onClick={() => handleCopyLink(page)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={copyingId === page.id}
                >
                  {copyingId === page.id ? (
                    <div className="w-3 h-3 animate-spin rounded-full border border-gray-400 border-t-transparent" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                
                <Button
                  onClick={() => handleOpenLink(page)}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Marketing Tip:</strong> Each link includes optimized social media previews that help attract new users to PetPort!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};