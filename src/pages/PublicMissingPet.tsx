import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Calendar, Clock, Share2, AlertTriangle, Stethoscope } from 'lucide-react';
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
  sex?: string;
  weight?: string;
  height?: string;
  microchip_id?: string;
  registration_number?: string;
  photoUrl?: string;
  fullBodyPhotoUrl?: string;
  lastSeenLocation?: string;
  lastSeenDate?: string;
  lastSeenTime?: string;
  distinctiveFeatures?: string;
  rewardAmount?: string;
  finderInstructions?: string;
  contacts: Array<{
    contact_name: string;
    contact_phone: string;
    contact_type: string;
  }>;
  updatedAt: string;
  isPublic?: boolean;
  galleryPhotoCount?: number;
  medicalAlert?: boolean;
  medicalConditions?: string;
}

export default function PublicMissingPet() {
  const { petId } = useParams<{ petId: string }>();
  const [petData, setPetData] = useState<MissingPetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Validate petId format
  const isValidPetId = petId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(petId);

  useEffect(() => {
    if (petId && isValidPetId) {
      fetchMissingPetData(petId);
    } else if (petId && !isValidPetId) {
      setError('Invalid pet ID format');
      setIsLoading(false);
    }
  }, [petId, isValidPetId]);

  const fetchMissingPetData = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Validate ID format before making DB calls
      if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        setError('Invalid pet ID format');
        return;
      }
      
      // Fetch pet basic info - no longer requires is_public, only missing status
      const { data: petInfo, error: petError } = await supabase
        .from('pets')
        .select('id, name, breed, species, age, sex, weight, height, microchip_id, registration_number, is_public')
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

      // Fetch contacts using pet_contacts table
      const { data: petContacts } = await supabase
        .from('pet_contacts')
        .select('contact_name, contact_phone, contact_type')
        .eq('pet_id', id);

      // Fetch medical data for medical alert
      const { data: medicalData } = await supabase
        .from('medical')
        .select('medical_alert, medical_conditions')
        .eq('pet_id', id)
        .single();

      // Fetch gallery photo count if pet is public
      let galleryPhotoCount = 0;
      if (petInfo.is_public) {
        const { count } = await supabase
          .from('gallery_photos')
          .select('*', { count: 'exact', head: true })
          .eq('pet_id', id);
        galleryPhotoCount = count || 0;
      }

      // Sanitize and prepare data
      const sanitizedData: MissingPetData = {
        id: petInfo.id,
        name: sanitizeText(petInfo.name),
        breed: sanitizeText(petInfo.breed || ''),
        species: sanitizeText(petInfo.species || ''),
        age: sanitizeText(petInfo.age || ''),
        sex: sanitizeText(petInfo.sex || ''),
        weight: sanitizeText(petInfo.weight || ''),
        height: sanitizeText(petInfo.height || ''),
        microchip_id: sanitizeText(petInfo.microchip_id || ''),
        registration_number: sanitizeText(petInfo.registration_number || ''),
        photoUrl: photos?.photo_url,
        fullBodyPhotoUrl: photos?.full_body_photo_url,
        lastSeenLocation: sanitizeText(lostData.last_seen_location || ''),
        lastSeenDate: lostData.last_seen_date,
        lastSeenTime: sanitizeText(lostData.last_seen_time || ''),
        distinctiveFeatures: sanitizeText(lostData.distinctive_features || ''),
        rewardAmount: sanitizeText(lostData.reward_amount || ''),
        finderInstructions: sanitizeText(lostData.finder_instructions || ''),
        contacts: petContacts || [],
        updatedAt: lostData.updated_at,
        isPublic: petInfo.is_public,
        galleryPhotoCount,
        medicalAlert: medicalData?.medical_alert || false,
        medicalConditions: sanitizeText(medicalData?.medical_conditions || '')
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
        {/* Medical Alert Banner - Smaller */}
        {petData.medicalAlert && petData.medicalConditions && (
          <Alert className="mb-6 border-red-600 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="ml-2">
              <strong className="text-red-900">MEDICAL ALERT:</strong>{' '}
              <span className="text-red-800">{petData.medicalConditions}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Pet Info Card */}
        <Card className="mb-6">
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
                <Badge variant="destructive" className="mt-2">
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
                  className="max-w-full h-auto max-h-96 mx-auto rounded-2xl border shadow-sm"
                />
              </div>
            )}

            {/* Profile Information */}
            <div className="p-4 rounded-lg border shadow-sm mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Stethoscope className="w-5 h-5 text-brand-primary" />
                <h3 className="font-semibold text-brand-primary">Profile Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {petData.sex && (
                  <div><strong>Sex/Gender:</strong> {petData.sex}</div>
                )}
                {petData.weight && (
                  <div><strong>Weight:</strong> {petData.weight}</div>
                )}
                {petData.height && (
                  <div><strong>Height:</strong> {petData.height}</div>
                )}
                {petData.microchip_id && (
                  <div><strong>Microchip ID:</strong> <span className="text-red-600 font-medium">{petData.microchip_id}</span></div>
                )}
                {petData.registration_number && (
                  <div><strong>Registration #:</strong> <span className="text-red-600 font-medium">{petData.registration_number}</span></div>
                )}
                <div><strong>Age:</strong> {petData.age}</div>
              </div>
            </div>

            {/* Last Seen Information */}
            {(petData.lastSeenLocation || petData.lastSeenDate) && (
              <div className="p-4 rounded-lg border shadow-sm mb-6">
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
              <div className="p-4 rounded-lg border shadow-sm mb-6">
                <h3 className="font-semibold text-brand-primary mb-2">Distinctive Features</h3>
                <p className="text-foreground">{truncateText(petData.distinctiveFeatures, 300)}</p>
              </div>
            )}

            {/* Reward */}
            {petData.rewardAmount && (
              <div className="p-4 rounded-lg border shadow-sm mb-6">
                <h3 className="font-semibold text-brand-primary mb-2">Reward Offered</h3>
                <p className="text-foreground text-lg font-medium">{petData.rewardAmount}</p>
              </div>
            )}

            {/* Contact Information */}
            {petData.contacts && petData.contacts.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-lg" style={{ color: '#5691af' }}>Emergency Contacts</h3>
                {petData.contacts.map((contact, index) => {
                  const hasPhone = contact.contact_phone && /\d{3}/.test(contact.contact_phone);
                  const phoneNumber = hasPhone ? contact.contact_phone.replace(/\D/g, '') : '';
                  
                  return (
                    <div key={index} className="p-3 rounded-lg border shadow-sm">
                      {hasPhone ? (
                        <a 
                          href={`tel:${phoneNumber}`}
                          className="block w-full"
                          aria-label={`Call ${contact.contact_name}`}
                        >
                          <div className="flex items-center space-x-2">
                             <Phone className={`w-4 h-4 ${contact.contact_type === 'emergency' ? 'text-primary' : 'text-primary'}`} />
                             <strong className={`${contact.contact_type === 'emergency' ? 'text-primary' : 'text-primary'} hover:opacity-80`}>
                              {contact.contact_name}:
                            </strong>
                          </div>
                          <div className="ml-6">
                            <span className={`font-medium hover:opacity-80 ${contact.contact_type === 'emergency' ? 'text-primary' : 'text-primary'}`}>
                              {contact.contact_phone}
                            </span>
                            <p className={`text-xs ${contact.contact_type === 'emergency' ? 'text-primary/70' : 'text-primary/80'}`}>Tap to call</p>
                          </div>
                        </a>
                      ) : (
                        <div>
                          <div className="flex items-center space-x-2">
                             <Phone className={`w-4 h-4 ${contact.contact_type === 'emergency' ? 'text-primary' : 'text-primary'}`} />
                             <strong className={contact.contact_type === 'emergency' ? 'text-primary' : 'text-primary'}>
                              {contact.contact_name}:
                            </strong>
                          </div>
                          <p className={`ml-6 font-medium ${contact.contact_type === 'emergency' ? 'text-primary' : 'text-primary'}`}>
                            {contact.contact_phone || 'No phone number'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Finder Instructions */}
            {petData.finderInstructions && (
              <div className="p-4 rounded-lg border shadow-sm mb-6">
                <h3 className="font-semibold text-brand-primary mb-2">If Found - Instructions</h3>
                <p className="text-foreground">{truncateText(petData.finderInstructions, 200)}</p>
              </div>
            )}

            {/* View More Photos Link */}
            {petData.isPublic && petData.galleryPhotoCount && petData.galleryPhotoCount > 0 && (
              <div className="text-center mb-6">
                <Button 
                  variant="outline"
                  onClick={() => window.open(`/gallery/${petData.id}`, '_blank')}
                  className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  View More Photos ({petData.galleryPhotoCount} total)
                </Button>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
              <Button 
                onClick={handleShare} 
                size="lg"
                className="bg-brand-primary hover:bg-brand-primary/90 text-white h-12 px-6 font-semibold text-base shadow-lg"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share This Alert
              </Button>
              <div className="w-full sm:w-auto">
                <SocialShareButtons 
                  petName={petData.name}
                  petId={petData.id}
                  isMissingPet={true}
                  context="missing"
                  shareUrlOverride={window.location.href}
                  compact={false}
                />
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-center text-muted-foreground text-sm mt-6">
              Last updated: {formatDate(petData.updatedAt)}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm pb-8">
          <div className="border-t border-gray-200 mb-6 max-w-md mx-auto" />
          <p>This is a missing pet alert for {petData.name}.</p>
          <p className="mt-2">
            Generated by{" "}
            <a 
              href={window.location.origin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              PetPort.app
            </a>
            {" "}— Be ready for travel, sitters, lost pet, and emergencies. Try it free.
          </p>
        </div>
      </div>
    </div>
  );
}