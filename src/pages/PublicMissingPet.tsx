import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Calendar, Clock, Share2, AlertTriangle } from 'lucide-react';
import { SocialShareButtons } from '@/components/SocialShareButtons';
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
      
      // Fetch pet basic info - must be public
      const { data: petInfo, error: petError } = await supabase
        .from('pets')
        .select('id, name, breed, species, age, is_public')
        .eq('id', id)
        .eq('is_public', true)
        .single();

      if (petError || !petInfo) {
        setError('Missing pet not found or not public');
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header Alert */}
      <div className="bg-red-600 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">⚠️ MISSING PET ALERT ⚠️</h1>
          <p className="text-red-100">Please help us find {petData.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Pet Info Card */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white">
            <CardTitle className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0">
                <img 
                  src={petData.photoUrl || "/placeholder.svg"} 
                  alt={petData.name}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-bold">{petData.name}</h2>
                <p className="text-red-100 text-lg">{petData.breed} • {petData.species} • {petData.age}</p>
                <Badge variant="destructive" className="mt-2 bg-white text-red-600">
                  MISSING
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
                  className="max-w-full h-auto max-h-96 mx-auto rounded-lg border-2 border-red-200"
                />
              </div>
            )}

            {/* Last Seen Information */}
            {(petData.lastSeenLocation || petData.lastSeenDate) && (
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Last Seen</h3>
                </div>
                {petData.lastSeenLocation && (
                  <p className="mb-2"><strong>Location:</strong> {petData.lastSeenLocation}</p>
                )}
                <div className="flex flex-wrap gap-4">
                  {petData.lastSeenDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <span>{formatDate(petData.lastSeenDate)}</span>
                    </div>
                  )}
                  {petData.lastSeenTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span>{petData.lastSeenTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Distinctive Features */}
            {petData.distinctiveFeatures && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">Distinctive Features</h3>
                <p className="text-blue-700">{truncateText(petData.distinctiveFeatures, 300)}</p>
              </div>
            )}

            {/* Reward */}
            {petData.rewardAmount && (
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Reward Offered</h3>
                <p className="text-green-700 text-lg font-medium">{petData.rewardAmount}</p>
              </div>
            )}

            {/* Contact Information */}
            {petData.emergencyContact && (
              <div className="bg-gold-300/20 p-4 rounded-lg mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-5 h-5 text-gold-500" />
                  <h3 className="font-semibold">Contact Information</h3>
                </div>
                <p className="font-medium">{petData.emergencyContact}</p>
              </div>
            )}

            {/* Finder Instructions */}
            {petData.finderInstructions && (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-purple-800 mb-2">If Found - Instructions</h3>
                <p className="text-purple-700">{truncateText(petData.finderInstructions, 200)}</p>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
              <Button onClick={handleShare} className="bg-blue-600 hover:bg-blue-700">
                <Share2 className="w-4 h-4 mr-2" />
                Share This Alert
              </Button>
              <SocialShareButtons 
                petName={petData.name}
                petId={petData.id}
                isMissingPet={true}
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