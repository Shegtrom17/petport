import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Calendar, Clock, Share2, AlertTriangle } from 'lucide-react';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { MetaTags } from '@/components/MetaTags';
import { sanitizeText, truncateText } from '@/utils/inputSanitizer';
import { toast } from 'sonner';

interface MissingPetData {
  id: string;
  name: string;
  breed: string;
  species: string;
  age: string;
  photoUrl?: string;
  fullBodyPhotoUrl?: string;
  lastSeenLocation?: string;
  lastSeenDate?: string;
  lastSeenTime?: string;
  distinctiveFeatures?: string;
  rewardAmount?: string;
  finderInstructions?: string;
  emergencyContact?: string;
  updatedAt: string;
}

export default function PublicMissingPet() {
  const { petId } = useParams<{ petId: string }>();
  const [petData, setPetData] = useState<MissingPetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (petId) {
      fetchMissingPetData(petId);
    }
  }, [petId]);

  const fetchMissingPetData = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Fetch pet basic info - no longer requires is_public, only missing status
      const { data: petInfo, error: petError } = await supabase
        .from('pets')
        .select('id, name, breed, species, age')
        .eq('id', id)
        .single();

      if (petError || !petInfo) {
        setError('Pet not found');
        return;
      }

      // Fetch lost pet data - public access via RLS policy
      const { data: lostData, error: lostError } = await supabase
        .from('lost_pet_data')
        .select('*')
        .eq('pet_id', id)
        .eq('is_missing', true)
        .single();

      if (lostError || !lostData) {
        setError('Pet is not currently marked as missing');
        return;
      }

      // Fetch photos
      const { data: photos } = await supabase
        .from('pet_photos')
        .select('photo_url, full_body_photo_url')
        .eq('pet_id', id)
        .single();

      // Fetch primary emergency contact only
      const { data: contact } = await supabase
        .from('contacts')
        .select('emergency_contact')
        .eq('pet_id', id)
        .single();

      // Sanitize and prepare data
      const sanitizedData: MissingPetData = {
        id: petInfo.id,
        name: sanitizeText(petInfo.name),
        breed: sanitizeText(petInfo.breed || ''),
        species: sanitizeText(petInfo.species || ''),
        age: sanitizeText(petInfo.age || ''),
        photoUrl: photos?.photo_url,
        fullBodyPhotoUrl: photos?.full_body_photo_url,
        lastSeenLocation: sanitizeText(lostData.last_seen_location || ''),
        lastSeenDate: lostData.last_seen_date,
        lastSeenTime: sanitizeText(lostData.last_seen_time || ''),
        distinctiveFeatures: sanitizeText(lostData.distinctive_features || ''),
        rewardAmount: sanitizeText(lostData.reward_amount || ''),
        finderInstructions: sanitizeText(lostData.finder_instructions || ''),
        emergencyContact: sanitizeText(contact?.emergency_contact || ''),
        updatedAt: lostData.updated_at
      };

      setPetData(sanitizedData);
    } catch (err) {
      console.error('Error fetching missing pet data:', err);
      setError('Failed to load missing pet information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const currentUrl = window.location.href;
    const shareData = {
      title: `MISSING: ${petData?.name} - ${petData?.breed}`,
      text: `Help find ${petData?.name}! Last seen: ${petData?.lastSeenLocation || 'location unknown'}`,
      url: currentUrl
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(currentUrl);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading missing pet information...</p>
        </div>
      </div>
    );
  }

  if (error || !petData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Missing pet information not available'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const pageUrl = window.location.href;
  const metaTitle = `Missing Pet: ${petData.name} (${petData.breed || petData.species})`;
  const metaDescription = `Help find ${petData.name}. Last seen ${petData.lastSeenLocation || 'unknown'} on ${formatDate(petData.lastSeenDate)}. Contact info on page.`;
  const metaImage = petData.photoUrl || petData.fullBodyPhotoUrl;

  return (
    <div className="min-h-screen bg-background">
      <MetaTags title={metaTitle} description={metaDescription} url={pageUrl} image={metaImage} type="article" />
      {/* Header Alert */}
      <div className="bg-brand-primary text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">⚠️ LOST PET ALERT ⚠️</h1>
          <p className="text-white/80">Please help us find {petData.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Pet Info Card */}
        <Card className="mb-6 bg-white/60 backdrop-blur-sm border-white/30">
          <CardHeader className="bg-brand-primary text-white">
            <CardTitle className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0">
                <img 
                  src={petData.photoUrl || "/placeholder.svg"} 
                  alt={petData.name}
                  className="w-24 h-24 rounded-full border-2 border-white/20 object-cover"
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-bold">{petData.name}</h2>
                <p className="text-white/80 text-lg">{petData.breed} • {petData.species} • {petData.age}</p>
                <Badge variant="destructive" className="mt-2 bg-white/20 text-white border-white/30">
                  LOST
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {petData.fullBodyPhotoUrl && (
              <div className="mb-6 text-center">
                <img 
                  src={petData.fullBodyPhotoUrl} 
                  alt={`${petData.name} full body`}
                  className="max-w-full h-auto max-h-96 mx-auto rounded-2xl border border-white/30"
                />
              </div>
            )}

            {/* Last Seen Information */}
            {(petData.lastSeenLocation || petData.lastSeenDate) && (
              <div className="bg-white/60 p-4 rounded-2xl border border-white/30 mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-semibold text-brand-primary">Last Seen</h3>
                </div>
                {petData.lastSeenLocation && (
                  <p className="mb-2"><strong>Location:</strong> {petData.lastSeenLocation}</p>
                )}
                <div className="flex flex-wrap gap-4">
                  {petData.lastSeenDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-brand-primary" />
                      <span>{formatDate(petData.lastSeenDate)}</span>
                    </div>
                  )}
                  {petData.lastSeenTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-brand-primary" />
                      <span>{petData.lastSeenTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Distinctive Features */}
            {petData.distinctiveFeatures && (
              <div className="bg-white/60 p-4 rounded-2xl border border-white/30 mb-6">
                <h3 className="font-semibold text-brand-primary mb-2">Distinctive Features</h3>
                <p className="text-foreground">{truncateText(petData.distinctiveFeatures, 300)}</p>
              </div>
            )}

            {/* Reward */}
            {petData.rewardAmount && (
              <div className="bg-white/60 p-4 rounded-2xl border border-white/30 mb-6">
                <h3 className="font-semibold text-brand-primary mb-2">Reward Offered</h3>
                <p className="text-foreground text-lg font-medium">{petData.rewardAmount}</p>
              </div>
            )}

            {/* Contact Information */}
            {petData.emergencyContact && (
              <div className="bg-white/60 p-4 rounded-2xl border border-white/30 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-5 h-5 text-brand-primary" />
                  <h3 className="font-semibold text-brand-primary">Contact Information</h3>
                </div>
                {/\d{3}/.test(petData.emergencyContact) ? (
                  <div>
                    <a 
                      href={`tel:${petData.emergencyContact.replace(/\D/g, '')}`}
                      className="font-medium text-foreground hover:text-primary"
                      aria-label="Call emergency contact"
                    >
                      {petData.emergencyContact}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">Tap to call</p>
                  </div>
                ) : (
                  <p className="font-medium">{petData.emergencyContact}</p>
                )}
              </div>
            )}

            {/* Finder Instructions */}
            {petData.finderInstructions && (
              <div className="bg-white/60 p-4 rounded-2xl border border-white/30 mb-6">
                <h3 className="font-semibold text-brand-primary mb-2">If Found - Instructions</h3>
                <p className="text-foreground">{truncateText(petData.finderInstructions, 200)}</p>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
              <Button onClick={handleShare} className="bg-brand-primary hover:bg-brand-primary/90 text-white">
                <Share2 className="w-4 h-4 mr-2" />
                Share This Alert
              </Button>
              <SocialShareButtons 
                petName={petData.name}
                petId={petData.id}
                isMissingPet={true}
                context="missing"
                shareUrlOverride={window.location.href}
              />
            </div>

            {/* Last Updated */}
            <div className="text-center text-muted-foreground text-sm mt-6">
              Last updated: {formatDate(petData.updatedAt)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}