import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Calendar, Clock, Share2, AlertTriangle, Stethoscope, Camera, AlertCircle, Heart, ArrowLeft, FileDown, Eye, Download, Printer, Loader2, Copy, Check, MessageCircle, Mail, Facebook, MessageSquare, Smartphone } from 'lucide-react';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { MetaTags } from '@/components/MetaTags';
import { sanitizeText, truncateText } from '@/utils/inputSanitizer';
import { toast } from 'sonner';
import QRCode from 'react-qr-code';
import { generateClientPetPDF, viewPDFBlob, downloadPDFBlob } from '@/services/clientPdfService';
import { sharePDFBlob } from '@/services/pdfService';
import { generateShareURL } from '@/utils/domainUtils';
import { shareViaMessenger, copyToClipboard } from '@/utils/messengerShare';

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
  galleryPhotos: Array<{
    id: string;
    url: string;
    caption?: string;
  }>;
  updatedAt: string;
  isPublic?: boolean;
  medicalAlert?: boolean;
  medicalConditions?: string;
}

export default function PublicMissingPet() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [petData, setPetData] = useState<MissingPetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageUrl = window.location.href;
  
  // Lost Pet PDF State (same as QuickShareHub)
  const [lostPetPdfBlob, setLostPetPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingLostPetPdf, setIsGeneratingLostPetPdf] = useState(false);
  
  // Share Options State
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  
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

      // Fetch gallery photos
      const { data: galleryPhotos } = await supabase
        .from('gallery_photos')
        .select('id, url, caption')
        .eq('pet_id', id)
        .order('position', { ascending: true });

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
        galleryPhotos: (galleryPhotos || []).map(photo => ({
          id: photo.id,
          url: photo.url,
          caption: sanitizeText(photo.caption || '')
        })),
        updatedAt: lostData.updated_at,
        isPublic: petInfo.is_public,
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

  const handleShare = async () => {
    const directUrl = window.location.href;
    
    // Generate edge function URL for OG tags
    const shareUrl = generateShareURL('missing-pet-share', petData?.id!, directUrl);
    
    const shareData = {
      title: `MISSING: ${petData?.name} - ${petData?.breed}`,
      text: `Help find ${petData?.name}! Last seen: ${petData?.lastSeenLocation || 'location unknown'}`,
      url: shareUrl  // ✅ Now uses edge function
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Missing alert shared!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
          // Fallback to clipboard
          navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard');
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  // Lost Pet PDF Handler (same as QuickShareHub)
  const handleGenerateLostPetPDF = async () => {
    if (!petData?.id) {
      toast.error("Pet data not available");
      return;
    }
    
    setIsGeneratingLostPetPdf(true);
    toast.info("Generating Lost Pet Flyer...", { description: "Creating your missing pet alert." });
    
    try {
      const result = await generateClientPetPDF(petData, 'lost_pet');
      
      if (result.success && result.blob) {
        setLostPetPdfBlob(result.blob);
        toast.success("Lost Pet Flyer Ready!", { description: "Your flyer has been generated." });
      } else {
        throw new Error(result.error || "Failed to generate PDF");
      }
    } catch (error: any) {
      console.error('[Lost Pet PDF] Generation failed:', error);
      toast.error("Generation Failed", { description: "Could not generate flyer." });
    } finally {
      setIsGeneratingLostPetPdf(false);
    }
  };

  const handleSharePdf = async () => {
    if (!lostPetPdfBlob || !petData) return;
    
    try {
      const result = await sharePDFBlob(lostPetPdfBlob, `${petData.name}_Missing_Flyer.pdf`, petData.name, 'profile');
      if (result.success) {
        toast.success(result.shared ? "PDF Shared!" : "Link Copied!", { description: result.message });
      } else {
        throw new Error(result.error || 'Share failed');
      }
    } catch (error) {
      console.error('Lost Pet PDF share error:', error);
      toast.error("Share Failed", { description: "Unable to share PDF. Please try download instead." });
    }
  };

  // Share handlers matching QuickShareHub
  const handleCopyLink = async () => {
    if (!petData) return;
    setCopyingLink(true);
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', petData.id, directUrl);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link Copied!', { description: 'Missing pet alert link copied to clipboard' });
    } catch (error) {
      toast.error('Copy Failed', { description: 'Please try again' });
    } finally {
      setCopyingLink(false);
    }
  };

  const handleSMSShare = () => {
    if (!petData) return;
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', petData.id, directUrl);
    const message = `🚨 MISSING: ${petData.name}! Last seen: ${petData.lastSeenLocation || 'location unknown'}. Help bring them home: ${shareUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const handleFacebookShare = () => {
    if (!petData) return;
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', petData.id, directUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleMessengerShare = async () => {
    if (!petData) return;
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', petData.id, directUrl);
    const needsFallback = await shareViaMessenger({
      url: shareUrl,
      title: `Help find ${petData.name}!`,
      text: `${petData.name} is missing! Please help share their alert.`
    });
    
    if (needsFallback) {
      const copySuccess = await copyToClipboard(shareUrl);
      if (copySuccess) {
        toast.info("🐾 Link copied! Now paste it in Messenger.", {
          duration: 3000,
        });
      }
    }
  };

  const handleEmailShare = () => {
    if (!petData) return;
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', petData.id, directUrl);
    const subject = `🚨 MISSING PET ALERT: ${petData.name}`;
    const body = `Please help us find ${petData.name}!\n\nLast seen: ${petData.lastSeenLocation || 'location unknown'}\n\nView the full missing pet alert:\n${shareUrl}\n\nEvery share helps bring ${petData.name} home safely. Thank you!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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

  const metaTitle = `Missing Pet: ${petData.name} (${petData.breed || petData.species})`;
  const metaDescription = `Help find ${petData.name}. Last seen ${petData.lastSeenLocation || 'unknown'} on ${formatDate(petData.lastSeenDate)}. Contact info on page.`;
  const metaImage = petData.photoUrl || petData.fullBodyPhotoUrl || "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og-lostpet.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <MetaTags title={metaTitle} description={metaDescription} url={pageUrl} image={metaImage} type="article" />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Urgent Missing Pet Alert Banner */}
        <Alert className="mb-6 border-red-600 bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <AlertDescription className="text-red-900 font-semibold text-lg">
            🚨 MISSING PET ALERT - PLEASE HELP BRING {petData.name.toUpperCase()} HOME SAFELY
          </AlertDescription>
        </Alert>

        {/* Medical Alert Banner */}
        {petData.medicalAlert && petData.medicalConditions && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-semibold">
              ⚠️ MEDICAL ALERT: {petData.medicalConditions}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Profile Card with Red Border */}
        <Card className="mb-6 border-2 border-red-500 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
            <CardTitle className="text-3xl font-bold text-center">
              MISSING: {petData.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Profile Photo with Red Border */}
            {petData.photoUrl && (
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-md">
                  <img 
                    src={petData.photoUrl} 
                    alt={`${petData.name}'s profile photo`}
                    className="w-full h-auto max-h-96 object-contain rounded-lg shadow-lg border-4 border-red-500"
                  />
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Last seen photo of {petData.name}
                  </p>
                </div>
              </div>
            )}

            {/* Full Body Photo with Red Border */}
            {petData.fullBodyPhotoUrl && (
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-md">
                  <h3 className="font-semibold text-red-600 mb-2 text-center">Full Body Photo</h3>
                  <img 
                    src={petData.fullBodyPhotoUrl} 
                    alt={`${petData.name}'s full body photo`}
                    className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg border-4 border-red-500"
                  />
                </div>
              </div>
            )}

            {/* Pet Details Grid */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg text-brand-primary mb-4">Pet Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Species</p>
                  <p className="font-semibold capitalize">{petData.species}</p>
                </div>
                {petData.breed && (
                  <div>
                    <p className="text-sm text-muted-foreground">Breed</p>
                    <p className="font-semibold">{petData.breed}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-semibold">{petData.age}</p>
                </div>
                {petData.weight && (
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-semibold">{petData.weight}</p>
                  </div>
                )}
                {petData.sex && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sex</p>
                    <p className="font-semibold capitalize">{petData.sex.replace('_', ' ')}</p>
                  </div>
                )}
                {petData.microchip_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">Microchip ID</p>
                    <p className="font-semibold font-mono text-xs">{petData.microchip_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reward Section with Green Alert */}
            {petData.rewardAmount && (
              <Alert className="bg-green-50 border-green-600 mb-6">
                <Heart className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-900 font-bold text-xl">
                  {petData.rewardAmount} REWARD
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Last Seen Information as Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <MapPin className="h-5 w-5" />
              Last Seen Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {petData.lastSeenLocation && (
              <div className="mb-4">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">Last Seen Location</p>
                    <p className="text-red-700 text-lg">{petData.lastSeenLocation}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {petData.lastSeenDate && (
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Date</p>
                    <p className="text-muted-foreground">{formatDate(petData.lastSeenDate)}</p>
                  </div>
                </div>
              )}
              {petData.lastSeenTime && (
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Clock className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">Time</p>
                    <p className="text-muted-foreground">{petData.lastSeenTime}</p>
                  </div>
                </div>
              )}
            </div>

            {petData.distinctiveFeatures && (
              <Alert className="bg-yellow-50 border-yellow-600">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <AlertDescription>
                  <p className="font-semibold text-yellow-900 mb-1">Distinctive Features</p>
                  <p className="text-yellow-800">{petData.distinctiveFeatures}</p>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Contact Information with Improved Styling */}
        {petData.contacts && petData.contacts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-brand-primary" />
                Emergency Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {petData.contacts.map((contact, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-blue-50 border border-blue-200 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">{contact.contact_name}</p>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                          {contact.contact_type.replace('_', ' ')}
                        </span>
                      </div>
                      <a 
                        href={`tel:${contact.contact_phone}`}
                        className="flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 font-medium text-lg"
                      >
                        <Phone className="h-5 w-5 flex-shrink-0" />
                        {contact.contact_phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code and Share Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Share This Missing Pet Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-inner border-2 border-gray-200">
                <QRCode value={pageUrl} size={200} />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan this QR code to view and share this missing pet alert on any device
            </p>
            
            {/* PDF Generation and Actions (same as QuickShareHub) */}
            <div className="space-y-3">
              {!lostPetPdfBlob ? (
                <Button
                  onClick={handleGenerateLostPetPDF}
                  disabled={isGeneratingLostPetPdf}
                  className="w-full"
                  variant="default"
                >
                  {isGeneratingLostPetPdf ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Flyer...
                    </>
                  ) : (
                    <>
                      <FileDown className="mr-2 h-4 w-4" />
                      Generate Missing Pet Flyer PDF
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => viewPDFBlob(lostPetPdfBlob, `${petData?.name || 'pet'}-lost-flyer.pdf`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      onClick={() => downloadPDFBlob(lostPetPdfBlob, `${petData?.name || 'pet'}-lost-flyer.pdf`)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => {
                        const url = URL.createObjectURL(lostPetPdfBlob);
                        const printWindow = window.open(url, '_blank');
                        if (printWindow) {
                          printWindow.onload = () => {
                            printWindow.print();
                            URL.revokeObjectURL(url);
                          };
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Printer className="mr-1 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                  <Button
                    onClick={handleSharePdf}
                    className="w-full"
                    variant="default"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share PDF Flyer
                  </Button>
                </div>
              )}
              
              {/* URL Share Options - Matches QuickShareHub */}
              <div className="space-y-3" data-touch-safe="true">
                {!showShareOptions ? (
                  <Button
                    onClick={() => setShowShareOptions(true)}
                    onTouchEnd={(e) => e.stopPropagation()}
                    className="w-full bg-red-600 hover:bg-red-700 text-white h-12 font-semibold"
                    style={{ touchAction: 'none' }}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share Missing Alert
                  </Button>
                ) : (
                  <>
                    {/* Quick Share Button */}
                    <Button
                      onClick={handleShare}
                      onTouchEnd={(e) => e.stopPropagation()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white h-12 font-semibold"
                      style={{ touchAction: 'none' }}
                    >
                      <Smartphone className="w-5 h-5 mr-2" />
                      Quick Share
                    </Button>
                    
                    {/* Top Row - 3 Buttons */}
                    <div className="grid grid-cols-3 gap-2" data-touch-safe="true">
                      <Button
                        onClick={handleCopyLink}
                        onTouchEnd={(e) => e.stopPropagation()}
                        variant="outline"
                        size="sm"
                        style={{ touchAction: 'none' }}
                        className="flex flex-col items-center py-3 px-2 h-16 border-red-600 text-red-700 hover:bg-red-50"
                      >
                        {copyingLink ? <Check className="w-4 h-4 mb-1" /> : <Copy className="w-4 h-4 mb-1" />}
                        <span className="text-xs font-medium">
                          {copyingLink ? 'Copied!' : 'Copy Link'}
                        </span>
                      </Button>
                      
                      <Button
                        onClick={handleSMSShare}
                        onTouchEnd={(e) => e.stopPropagation()}
                        variant="outline"
                        size="sm"
                        style={{ touchAction: 'none' }}
                        className="flex flex-col items-center py-3 px-2 h-16 border-red-600 text-red-700 hover:bg-red-50"
                      >
                        <MessageCircle className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium">Text/SMS</span>
                      </Button>
                      
                      <Button
                        onClick={handleEmailShare}
                        onTouchEnd={(e) => e.stopPropagation()}
                        variant="outline"
                        size="sm"
                        style={{ touchAction: 'none' }}
                        className="flex flex-col items-center py-3 px-2 h-16 border-red-600 text-red-700 hover:bg-red-50"
                      >
                        <Mail className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium">Email</span>
                      </Button>
                    </div>
                    
                    {/* Bottom Row - 3 Buttons */}
                    <div className="grid grid-cols-3 gap-2" data-touch-safe="true">
                      <Button
                        onClick={handleFacebookShare}
                        onTouchEnd={(e) => e.stopPropagation()}
                        variant="outline"
                        size="sm"
                        style={{ touchAction: 'none' }}
                        className="flex flex-col items-center py-3 px-2 h-16 border-red-600 text-red-700 hover:bg-red-50"
                      >
                        <Facebook className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium">Facebook</span>
                      </Button>
                      
                      <Button
                        onClick={handleMessengerShare}
                        onTouchEnd={(e) => e.stopPropagation()}
                        variant="outline"
                        size="sm"
                        style={{ touchAction: 'none' }}
                        className="flex flex-col items-center py-3 px-2 h-16 border-red-600 text-red-700 hover:bg-red-50"
                      >
                        <MessageSquare className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium">Messenger</span>
                      </Button>
                      
                      <Button
                        onClick={() => {
                          handleCopyLink();
                          toast.info("Instagram doesn't support direct sharing. Link copied - paste it in Instagram Stories or posts.", {
                            duration: 4000,
                          });
                        }}
                        onTouchEnd={(e) => e.stopPropagation()}
                        variant="outline"
                        size="sm"
                        style={{ touchAction: 'none' }}
                        className="flex flex-col items-center py-3 px-2 h-16 border-red-600 text-red-700 hover:bg-red-50"
                      >
                        <Camera className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium">Instagram</span>
                      </Button>
                    </div>

                    {/* Close Button */}
                    <Button
                      onClick={() => setShowShareOptions(false)}
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs mt-2"
                    >
                      Close
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finder Instructions */}
        {petData.finderInstructions && (
          <Card className="mb-6 border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-900">Instructions for Finder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-900 whitespace-pre-wrap">{petData.finderInstructions}</p>
            </CardContent>
          </Card>
        )}

        {/* Gallery Photos with Enhanced Card Layout */}
        {petData.galleryPhotos && petData.galleryPhotos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-brand-primary" />
                Additional Photos of {petData.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                These photos can help identify {petData.name} from different angles and in various situations
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {petData.galleryPhotos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-red-200 shadow-sm hover:shadow-lg hover:border-red-400 transition-all">
                    <img 
                      src={photo.url} 
                      alt={photo.caption || `${petData.name} photo`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-center text-muted-foreground mt-4">
                Showing all {petData.galleryPhotos.length} photos • Tap to view larger
              </p>
            </CardContent>
          </Card>
        )}

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