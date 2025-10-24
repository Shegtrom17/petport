import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  Phone, 
  Heart,
  Clock,
  AlertCircle,
  Camera,
  Sparkles,
  FileDown,
  Eye,
  Download,
  Printer,
  Loader2,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Facebook,
  MessageSquare,
  Smartphone,
  Send,
  X,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { ContactOwnerModal } from "@/components/ContactOwnerModal";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText, truncateText } from "@/utils/inputSanitizer";
import { generateClientPetPDF, viewPDFBlob, downloadPDFBlob } from '@/services/clientPdfService';
import { sharePDFBlob } from '@/services/pdfService';
import { generateShareURL } from '@/utils/domainUtils';
import { shareViaMessenger, copyToClipboard } from '@/utils/messengerShare';
import { shareQRCode } from '@/utils/qrShare';
import { toast } from 'sonner';

const FINNEGAN_ID = "297d1397-c876-4075-bf24-41ee1862853a";

interface PetSighting {
  id: string;
  pet_id: string;
  sighting_text: string;
  reported_at: string;
  is_visible: boolean;
}

export default function DemoMissingPet() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // PDF State
  const [lostPetPdfBlob, setLostPetPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingLostPetPdf, setIsGeneratingLostPetPdf] = useState(false);
  
  // Share Options State
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  
  // Contact Owner Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Sighting Board State
  const [sightings, setSightings] = useState<PetSighting[]>([]);
  const [sightingText, setSightingText] = useState('');
  const [isSubmittingSighting, setIsSubmittingSighting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch Finnegan's live data from the database
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('*')
          .eq('id', FINNEGAN_ID)
          .single();

        if (petError) throw petError;

        // Fetch lost pet data
        const { data: lostData, error: lostError } = await supabase
          .from('lost_pet_data')
          .select('*')
          .eq('pet_id', FINNEGAN_ID)
          .single();

        // Fetch photos
        const { data: photosData, error: photosError } = await supabase
          .from('pet_photos')
          .select('*')
          .eq('pet_id', FINNEGAN_ID)
          .single();

        // Fetch contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from('pet_contacts')
          .select('*')
          .eq('pet_id', FINNEGAN_ID);

        // Fetch medical data
        const { data: medicalData, error: medicalError } = await supabase
          .from('medical')
          .select('*')
          .eq('pet_id', FINNEGAN_ID)
          .single();

        // Fetch gallery photos
        const { data: galleryData, error: galleryError } = await supabase
          .from('gallery_photos')
          .select('*')
          .eq('pet_id', FINNEGAN_ID)
          .order('position', { ascending: true });

        // Sanitize and build the data object
        const combinedData = {
          id: petData.id,
          name: sanitizeText(petData.name),
          species: sanitizeText(petData.species),
          breed: sanitizeText(petData.breed),
          age: sanitizeText(petData.age),
          weight: sanitizeText(petData.weight),
          sex: petData.sex,
          microchip_id: sanitizeText(petData.microchip_id),
          photo_url: photosData?.photo_url || '',
          full_body_photo_url: photosData?.full_body_photo_url || '',
          lost_pet_data: lostData ? {
            is_missing: lostData.is_missing,
            last_seen_location: sanitizeText(lostData.last_seen_location),
            last_seen_date: lostData.last_seen_date ? new Date(lostData.last_seen_date).toLocaleDateString() : '',
            last_seen_time: sanitizeText(lostData.last_seen_time),
            distinctive_features: sanitizeText(lostData.distinctive_features),
            reward_amount: sanitizeText(lostData.reward_amount),
            finder_instructions: sanitizeText(lostData.finder_instructions),
            contact_priority: sanitizeText(lostData.contact_priority),
            emergency_notes: sanitizeText(lostData.emergency_notes),
          } : null,
          pet_contacts: contactsData?.map(c => ({
            id: c.id,
            contact_name: sanitizeText(c.contact_name),
            contact_phone: sanitizeText(c.contact_phone),
            contact_type: sanitizeText(c.contact_type),
          })) || [],
          medical: medicalData ? {
            medical_alert: medicalData.medical_alert,
            medical_conditions: sanitizeText(medicalData.medical_conditions),
          } : null,
          gallery_photos: galleryData?.map(g => ({
            id: g.id,
            url: g.url,
            caption: sanitizeText(g.caption),
          })) || [],
        };

        setData(combinedData);
      } catch (error) {
        console.error('Error loading demo data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
    fetchSightings(FINNEGAN_ID);
    
    // Subscribe to real-time sighting updates
    const channel = supabase
      .channel('sighting-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pet_sightings',
          filter: `pet_id=eq.${FINNEGAN_ID}`
        },
        (payload) => {
          const newSighting = payload.new as PetSighting;
          if (newSighting.is_visible) {
            setSightings(prev => [newSighting, ...prev]);
            toast.success('New sighting reported!', {
              description: 'Someone just reported seeing this pet'
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // PDF Handler
  const handleGenerateLostPetPDF = async () => {
    if (!data?.id) {
      toast.error("Pet data not available");
      return;
    }
    
    setIsGeneratingLostPetPdf(true);
    toast.info("Generating Lost Pet Flyer...", { description: "Creating your missing pet alert." });
    
    try {
      const result = await generateClientPetPDF(data, 'lost_pet');
      
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
    if (!lostPetPdfBlob || !data) return;
    
    try {
      const result = await sharePDFBlob(lostPetPdfBlob, `${data.name}_Missing_Flyer.pdf`, data.name, 'profile');
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

  // Share handlers
  const handleCopyLink = async () => {
    if (!data) return;
    setCopyingLink(true);
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', data.id, directUrl);
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
    if (!data) return;
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', data.id, directUrl);
    const message = `🚨 MISSING: ${data.name}! Last seen: ${data.lost_pet_data?.last_seen_location || 'location unknown'}. Help bring them home: ${shareUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const handleFacebookShare = () => {
    if (!data) return;
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', data.id, directUrl);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleMessengerShare = async () => {
    if (!data) return;
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', data.id, directUrl);
    const needsFallback = await shareViaMessenger({
      url: shareUrl,
      title: `Help find ${data.name}!`,
      text: `${data.name} is missing! Please help share their alert.`
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
    if (!data) return;
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', data.id, directUrl);
    const subject = `🚨 MISSING PET ALERT: ${data.name}`;
    const body = `Please help us find ${data.name}!\n\nLast seen: ${data.lost_pet_data?.last_seen_location || 'location unknown'}\n\nView the full missing pet alert:\n${shareUrl}\n\nEvery share helps bring ${data.name} home safely. Thank you!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareQRCode = async () => {
    if (!data) return;
    await shareQRCode(
      window.location.href, 
      data.name, 
      'LOST PET',
      'dc2626',
      `🚨 LOST PET: ${data.name} - Scan this QR code to help find them!`
    );
  };

  const handleShare = async () => {
    if (!data) return;
    const directUrl = window.location.href;
    const shareUrl = generateShareURL('missing-pet-share', data.id, directUrl);
    const shareData = {
      title: `LOST PET: ${data.name}`,
      text: `🚨 ${data.name} is missing! Last seen: ${data.lost_pet_data?.last_seen_location || 'location unknown'}. ${data.lost_pet_data?.reward_amount ? `REWARD: $${data.lost_pet_data.reward_amount}` : ''}`,
      url: shareUrl,
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      await handleCopyLink();
    }
  };

  // Sighting Board Functions
  const fetchSightings = async (id: string) => {
    try {
      const { data: sightingsData, error } = await supabase
        .from('pet_sightings')
        .select('*')
        .eq('pet_id', id)
        .eq('is_visible', true)
        .order('reported_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setSightings(sightingsData || []);
    } catch (error) {
      console.error('Error fetching sightings:', error);
    }
  };

  const handleReportSighting = async () => {
    if (!sightingText.trim() || !FINNEGAN_ID) return;
    
    setIsSubmittingSighting(true);
    try {
      const { error } = await supabase
        .from('pet_sightings')
        .insert({
          pet_id: FINNEGAN_ID,
          sighting_text: sightingText.trim().slice(0, 200),
          is_visible: true
        });
      
      if (error) throw error;
      
      // Send notification email to owner (fire and forget)
      supabase.functions.invoke('notify-sighting', {
        body: {
          petId: FINNEGAN_ID,
          sightingText: sightingText.trim().slice(0, 200),
          reportedAt: new Date().toISOString()
        }
      }).catch(err => console.error('Failed to send sighting notification:', err));
      
      setSightingText('');
      toast.success('Sighting reported!', {
        description: 'Thank you for helping find this pet'
      });
    } catch (error) {
      console.error('Error reporting sighting:', error);
      toast.error('Failed to report sighting', {
        description: 'Please try again'
      });
    } finally {
      setIsSubmittingSighting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Unable to load demo data</p>
      </div>
    );
  }

  const lostData = data.lost_pet_data;
  const shareUrl = "https://petport.app/demo/missing-pet";
  const shareTitle = `LOST PET: ${data.name} - ${data.breed || data.species}`;
  const shareText = `Please help find ${data.name}! Last seen: ${lostData?.last_seen_location}. ${lostData?.reward_amount} REWARD!`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <MetaTags 
        title={`LOST PET: ${data.name} - Missing ${data.breed || data.species} Alert`}
        description={`URGENT: ${data.name} is missing! Last seen ${lostData.last_seen_location}. ${lostData.reward_amount} reward. Please help bring ${data.name} home safely.`}
        image="https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/og-images/general-og.png"
        url={shareUrl}
        type="article"
      />

      {/* Live Demo Banner */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white py-3 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">✨ Demo – PetPort LiveLink</span>
          <a href="/#pricing">
            <Button 
              variant="outline" 
              size="sm"
              className="ml-4 bg-white text-brand-primary hover:bg-brand-cream border-white"
            >
              Get Started Today
            </Button>
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Urgent Header Alert */}
        <Alert className="mb-6 border-red-600 bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <AlertDescription className="text-red-900 font-semibold text-lg">
            🚨 MISSING PET ALERT - PLEASE HELP BRING {data.name.toUpperCase()} HOME SAFELY
          </AlertDescription>
        </Alert>

        {/* Medical Alert Banner */}
        {data.medical?.medical_alert && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-semibold">
              ⚠️ MEDICAL ALERT: {data.medical.medical_conditions}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Profile Card */}
        <Card className="mb-6 border-2 border-red-500 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
            <CardTitle className="text-3xl font-bold text-center">
              MISSING: {data.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Profile Photo with Red Border */}
            {data.photo_url && (
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-md">
                  <img 
                    src={data.photo_url} 
                    alt={`${data.name}'s profile photo`}
                    className="w-full h-auto max-h-96 object-contain rounded-lg shadow-lg border-4 border-red-500"
                  />
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Last seen photo of {data.name}
                  </p>
                </div>
              </div>
            )}

            {/* Full Body Photo with Red Border */}
            {data.full_body_photo_url && (
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-md">
                  <h3 className="font-semibold text-red-600 mb-2 text-center">Full Body Photo</h3>
                  <img 
                    src={data.full_body_photo_url} 
                    alt={`${data.name}'s full body photo`}
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
                  <p className="font-semibold capitalize">{data.species}</p>
                </div>
                {data.breed && (
                  <div>
                    <p className="text-sm text-muted-foreground">Breed</p>
                    <p className="font-semibold">{data.breed}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-semibold">{data.age}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-semibold">{data.weight}lb</p>
                </div>
                {data.sex && (
                  <div>
                    <p className="text-sm text-muted-foreground">Sex</p>
                    <p className="font-semibold capitalize">{data.sex.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {data.microchip_id && (
                  <div>
                    <p className="text-sm text-muted-foreground">Microchip ID</p>
                    <p className="font-semibold">{data.microchip_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reward Amount */}
            {lostData.reward_amount && (
              <div className="bg-yellow-100 border-2 border-yellow-500 p-4 rounded-lg text-center">
                <Badge className="bg-yellow-500 text-white text-lg px-6 py-2 font-bold">
                  ${lostData.reward_amount} REWARD
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Seen Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <MapPin className="h-6 w-6" />
              Last Seen Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-lg">{lostData.last_seen_location}</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-semibold">{lostData.last_seen_date}</p>
                    <p className="text-sm">{lostData.last_seen_time}</p>
                  </div>
                </div>
              </div>
            </div>

            {lostData.distinctive_features && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Distinctive Features
                </h4>
                <p className="text-yellow-900">{lostData.distinctive_features}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        {data.pet_contacts && data.pet_contacts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-6 w-6 text-brand-primary" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.pet_contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-semibold text-brand-primary">{contact.contact_name}</p>
                    <Badge variant="outline" className="mt-1">
                      {contact.contact_type}
                    </Badge>
                  </div>
                  <a 
                    href={`tel:${contact.contact_phone}`}
                    className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.contact_phone}
                  </a>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Button
                  onClick={() => setShowContactModal(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Owner via Email
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Community Sighting Board */}
        <Card className="mb-6 border-blue-300 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MapPin className="h-5 w-5" />
              Community Sighting Updates
            </CardTitle>
            <p className="text-sm text-blue-700 mt-2">
              Help bring {data.name} home! Report any sightings or check recent community reports.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Report Sighting Form */}
            <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
              <label className="font-semibold text-blue-900 mb-2 block">
                Have you seen {data.name}?
              </label>
              <Textarea
                placeholder={`Where did you see ${data.name}? Include location, date/time, and any other details...`}
                value={sightingText}
                onChange={(e) => setSightingText(e.target.value)}
                maxLength={200}
                className="mb-2 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {sightingText.length}/200 characters
                </span>
                <Button
                  onClick={handleReportSighting}
                  disabled={!sightingText.trim() || isSubmittingSighting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {isSubmittingSighting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Report Sighting
                </Button>
              </div>
            </div>

            {/* Sightings List */}
            {sightings.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Recent Reports ({sightings.length})
                </h4>
                {sightings.map((sighting) => (
                  <div 
                    key={sighting.id} 
                    className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm hover:border-blue-400 transition-colors"
                  >
                    <p className="text-sm text-gray-700 mb-2">{sighting.sighting_text}</p>
                    <p className="text-xs text-muted-foreground">
                      Reported {formatTimeAgo(sighting.reported_at)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sightings reported yet.</p>
                <p className="text-xs mt-1">Be the first to help!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Finder Instructions */}
        {lostData.finder_instructions && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-brand-primary" />
                If You Find {data.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-brand-primary-dark leading-relaxed mb-4">
                {lostData.finder_instructions}
              </p>
              {lostData.contact_priority && (
                <Alert>
                  <AlertDescription>
                    <strong>Contact Priority:</strong> {lostData.contact_priority}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact Owner via Email Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowContactModal(true)}
            className="w-full bg-[#5691af] hover:bg-[#4a7c95] text-white py-6 text-lg"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Owner via Email
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-2">
            🔒 Messages are sent through PetPort's secure relay system
          </p>
        </div>

        {/* Share & QR Code Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Share This Missing Pet Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 1. QR CODE DISPLAY */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-inner border-2 border-gray-200">
                <QRCode 
                  value={shareUrl} 
                  size={200}
                  fgColor="#dc2626"
                  bgColor="#ffffff"
                />
              </div>
            </div>
            
            {/* 2. SHARE QR CODE BUTTON */}
            <Button
              onClick={handleShareQRCode}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share LOST PET QR Code
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Scan this QR code to view and share this missing pet alert on any device
            </p>
            
            {/* 3. PDF GENERATION */}
            <div className="space-y-3">
              {!lostPetPdfBlob ? (
                <Button
                  onClick={handleGenerateLostPetPDF}
                  disabled={isGeneratingLostPetPdf}
                  className="w-full text-white"
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
                      onClick={() => viewPDFBlob(lostPetPdfBlob, `${data.name}-lost-flyer.pdf`)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      onClick={() => downloadPDFBlob(lostPetPdfBlob, `${data.name}-lost-flyer.pdf`)}
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
            </div>
            
            {/* 4. SHARE MISSING ALERT (Collapsible) */}
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
                  
                  {/* 3x2 Grid */}
                  <div className="grid grid-cols-3 gap-2" data-touch-safe="true">
                    <Button onClick={handleCopyLink} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                      {copyingLink ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      <span className="text-xs">Copy Link</span>
                    </Button>
                    <Button onClick={handleSMSShare} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                      <Smartphone className="h-5 w-5" />
                      <span className="text-xs">SMS</span>
                    </Button>
                    <Button onClick={handleEmailShare} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                      <Mail className="h-5 w-5" />
                      <span className="text-xs">Email</span>
                    </Button>
                    <Button onClick={handleFacebookShare} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                      <Facebook className="h-5 w-5" />
                      <span className="text-xs">Facebook</span>
                    </Button>
                    <Button onClick={handleMessengerShare} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-xs">Messenger</span>
                    </Button>
                    <Button onClick={handleEmailShare} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="text-xs">More</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gallery Preview */}
        {data.gallery_photos && data.gallery_photos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-brand-primary" />
                Additional Photos of {data.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                These photos can help identify {data.name} from different angles and in various situations
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.gallery_photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.caption || `${data.name} photo`}
                      className="w-full h-40 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-brand-primary"
                    />
                    {photo.caption && (
                      <p className="text-xs text-center mt-1 text-muted-foreground line-clamp-2">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-center text-muted-foreground mt-4">
                Showing all {data.gallery_photos.length} photos • Tap to view larger
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg p-8 text-center text-white mb-6">
          <h2 className="text-2xl font-bold mb-3">Protect Your Pet with a PetPort Emergency Page</h2>
          <p className="mb-4 text-white/90">Be prepared with a shareable emergency profile and QR code</p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-white text-brand-primary hover:bg-brand-cream"
          >
            Create Emergency Page
          </Button>
        </div>

        {/* Contact Owner Modal */}
        <ContactOwnerModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          petId={data.id}
          petName={data.name}
          pageType="missing"
        />

        {/* Branding Footer */}
        <div className="text-center py-6 border-t">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href="https://petport.app"
              className="text-brand-primary hover:text-brand-secondary font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              PetPort.app
            </a>
            {" "}— Digital Emergency Profiles for Pets
          </p>
        </div>
      </div>
    </div>
  );
}
