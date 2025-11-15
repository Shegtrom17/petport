import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MapPin, Phone, Star, Award, GraduationCap, Plane, Trophy, Briefcase, Shield, Building, Mail, Globe, Camera, AlertTriangle, FileText, Eye, Stethoscope, X, MessageSquare, Clock } from "lucide-react";

import { MetaTags } from "@/components/MetaTags";
import { AddReviewForm } from "@/components/AddReviewForm";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { ContactOwnerModal } from "@/components/ContactOwnerModal";
import { AzureButton } from "@/components/ui/azure-button";
import { sanitizeText, sanitizeHtml } from "@/utils/inputSanitizer";
import { smoothScrollIntoViewIfNeeded } from "@/utils/smoothScroll";
import { ServiceProviderNotesBoard } from "@/components/ServiceProviderNotesBoard";
import { PublicPageQRCode } from "@/components/PublicPageQRCode";

const PublicProfile = () => {
  const { petId } = useParams<{ petId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [petData, setPetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const reviewFormRef = React.useRef<HTMLDivElement>(null);
  const [careUpdates, setCareUpdates] = useState<any[]>([]);

  useEffect(() => {
    // Signal to Prerender.io that page is ready after meta tags render
    const timer = setTimeout(() => {
      (window as any).prerenderReady = true;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleClose = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated user previewing their own LiveLink
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo');
      
      if (returnTo && petId) {
        // Navigate directly to the specific tab they came from
        navigate(`/profile?pet=${petId}&tab=${returnTo}`);
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/profile');
      }
    } else {
      // Anonymous visitor logic (unchanged)
      const referrer = document.referrer;
      const isFromDemoOrMarketing = referrer.includes('/demos') || 
                                    referrer.includes('/lost-pet-features') ||
                                    referrer.includes('/learn');
      
      if (window.history.length > 1 && !isFromDemoOrMarketing) {
        navigate(-1);
      } else if (isFromDemoOrMarketing) {
        navigate('/demos');
      } else {
        navigate('/');
      }
    }
  };

  const handleOpenReviewForm = () => {
    setShowAddReview(true);
    setTimeout(() => {
      if (reviewFormRef.current) {
        smoothScrollIntoViewIfNeeded(reviewFormRef.current);
      }
    }, 100);
  };

  const handleReviewSuccess = async () => {
    setShowAddReview(false);
    // Reload pet data to show the new review
    if (!petId) return;
    const { data } = await supabase
      .from('pets')
      .select(`
        *,
        pet_photos (*),
        professional_data (*),
        medical (*),
        contacts (*),
        pet_contacts (*),
        care_instructions (*),
        certifications (*),
        documents (*),
        reviews (*),
        training (*),
        travel_locations (*),
        gallery_photos (*),
        achievements (*),
        experiences (*),
        map_pins (*)
      `)
      .eq('id', petId)
      .eq('is_public', true)
      .maybeSingle();
    
    if (data) {
      setPetData(data);
    }
  };

  useEffect(() => {
    const loadPetData = async () => {
      if (!petId) {
        setError("Pet ID not provided");
        setIsLoading(false);
        return;
      }

      // Handle case where user accesses route pattern /:petId instead of actual pet ID
      if (petId === ':petId') {
        const isPreview = window.location.hostname.includes('lovableproject.com') || 
                         window.location.hostname.includes('lovable.app');
        
        if (isPreview) {
          try {
            // Get first available public pet for development
            const { data: publicPets } = await supabase
              .from('pets')
              .select('id, name')
              .eq('is_public', true)
              .limit(1);
            
            if (publicPets && publicPets.length > 0) {
              window.location.href = `/profile/${publicPets[0].id}`;
              return;
            }
          } catch (err) {
            console.error('Error finding public pet:', err);
          }
        }
        
        setError("Invalid pet ID format. Please use a valid pet profile URL.");
        setIsLoading(false);
        return;
      }

      try {
        const debug = [`Loading pet ID: ${petId}`, `Attempt: ${retryCount + 1}`, `Timestamp: ${new Date().toISOString()}`];
        setDebugInfo(debug);
        
        console.log('🔍 Loading public profile for pet:', petId);
        
        // Add cache-busting parameter
        const cacheBuster = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Fetch public pet data using the new RLS policy with all related data
        const { data, error: fetchError } = await supabase
          .from('pets')
          .select(`
            *,
            pet_photos (*),
            professional_data (*),
            medical (*),
            contacts (*),
            pet_contacts (*),
            care_instructions (*),
            certifications (*),
            documents (*),
            reviews (*),
            training (*),
            travel_locations (*),
            gallery_photos (*),
            achievements (*),
            experiences (*),
            map_pins (*)
          `)
          .eq('id', petId)
          .eq('is_public', true)
          .maybeSingle();

        if (fetchError) {
          console.error('❌ Supabase fetch error:', fetchError);
          debug.push(`Fetch error: ${fetchError.message}`);
          setDebugInfo([...debug]);
          throw fetchError;
        }

        if (!data) {
          console.warn('⚠️ No data returned for pet:', petId);
          debug.push('No data returned - pet may not exist or not public');
          setDebugInfo([...debug]);
          setError("Pet profile not found or not public");
          setIsLoading(false);
          return;
        }

        console.log('✅ Pet data loaded successfully:', {
          name: data.name,
          hasGallery: data.gallery_photos?.length || 0,
          hasTraining: data.training?.length || 0,
          hasReviews: data.reviews?.length || 0,
          hasAchievements: data.achievements?.length || 0,
          hasExperiences: data.experiences?.length || 0
        });

        debug.push(`Data loaded: ${data.name}`, `Gallery photos: ${data.gallery_photos?.length || 0}`, `Training records: ${data.training?.length || 0}`);
        setDebugInfo([...debug]);

        // Sanitize all text data before setting state
        const sanitizedData = {
          ...data,
          name: sanitizeText(data.name || ''),
          bio: sanitizeText(data.bio || ''),
          breed: sanitizeText(data.breed || ''),
          species: sanitizeText(data.species || ''),
          age: sanitizeText(data.age || ''),
          weight: sanitizeText(data.weight || ''),
          state: sanitizeText(data.state || ''),
          petport_id: sanitizeText(data.petport_id || ''),
          professional_data: data.professional_data ? {
            ...data.professional_data,
            support_animal_status: sanitizeText(data.professional_data.support_animal_status || '')
          } : null,
          medical: data.medical ? {
            ...data.medical,
            medical_conditions: sanitizeText(data.medical.medical_conditions || ''),
            last_vaccination: sanitizeText(data.medical.last_vaccination || ''),
            medical_emergency_document: sanitizeText(data.medical.medical_emergency_document || '')
          } : null,
          care_instructions: data.care_instructions ? {
            ...data.care_instructions,
            feeding_schedule: sanitizeText(data.care_instructions.feeding_schedule || ''),
            morning_routine: sanitizeText(data.care_instructions.morning_routine || ''),
            evening_routine: sanitizeText(data.care_instructions.evening_routine || ''),
            behavioral_notes: sanitizeText(data.care_instructions.behavioral_notes || ''),
            favorite_activities: sanitizeText(data.care_instructions.favorite_activities || ''),
            caretaker_notes: sanitizeText(data.care_instructions.caretaker_notes || ''),
            allergies: sanitizeText(data.care_instructions.allergies || '')
          } : null,
          certifications: data.certifications?.map((cert: any) => ({
            ...cert,
            type: sanitizeText(cert.type || ''),
            issuer: sanitizeText(cert.issuer || ''),
            certification_number: sanitizeText(cert.certification_number || ''),
            notes: sanitizeText(cert.notes || '')
          })) || [],
          documents: data.documents?.map((doc: any) => ({
            ...doc,
            name: sanitizeText(doc.name || ''),
            type: sanitizeText(doc.type || '')
          })) || [],
          reviews: data.reviews?.map((review: any) => ({
            ...review,
            id: review.id,
            reviewer_name: sanitizeText(review.reviewer_name || ''),
            text: sanitizeText(review.text || ''),
            location: sanitizeText(review.location || ''),
            type: sanitizeText(review.type || ''),
            response: null // Will be populated next
          })) || [],
          training: data.training?.map((course: any) => ({
            ...course,
            course: sanitizeText(course.course || ''),
            facility: sanitizeText(course.facility || '')
          })) || [],
          travel_locations: data.travel_locations?.map((location: any) => ({
            ...location,
            name: sanitizeText(location.name || ''),
            type: sanitizeText(location.type || '')
          })) || [],
          gallery_photos: data.gallery_photos?.map((photo: any) => ({
            ...photo,
            caption: sanitizeText(photo.caption || '')
          })) || [],
          achievements: data.achievements?.map((achievement: any) => ({
            ...achievement,
            title: sanitizeText(achievement.title || ''),
            description: sanitizeText(achievement.description || '')
          })) || [],
          // Clean up Map Pins: prefer real titles, hide empty "custom" pins, and dedupe
          map_pins: (data.map_pins || [])
            .map((pin: any) => {
              const loc = (data.travel_locations || []).find((l: any) => l.id === pin.travel_location_id);
              const title = sanitizeText(pin.title || loc?.name || '');
              const description = sanitizeText(pin.description || loc?.notes || '');
              const category = sanitizeText(pin.category || '');
              return { ...pin, title, description, category };
            })
            .filter((pin: any) => (pin.title && pin.title.toLowerCase() !== 'custom') || pin.description)
            .reduce((acc: any[], pin: any) => {
              const key = `${pin.title}|${pin.description}|${pin.latitude}|${pin.longitude}`;
              if (!acc.some((p) => `${p.title}|${p.description}|${p.latitude}|${p.longitude}` === key)) acc.push(pin);
              return acc;
            }, []),
          experiences: data.experiences?.map((experience: any) => ({
            ...experience,
            activity: sanitizeText(experience.activity || ''),
            description: sanitizeText(experience.description || '')
          })) || []
        };

        // Fetch review responses
        if (sanitizedData.reviews && sanitizedData.reviews.length > 0) {
          const reviewIds = sanitizedData.reviews.map((r: any) => r.id).filter(Boolean);
          
          if (reviewIds.length > 0) {
            const { data: responses } = await supabase
              .from('review_responses')
              .select('*')
              .in('review_id', reviewIds);

            sanitizedData.reviews = sanitizedData.reviews.map((review: any) => ({
              ...review,
              response: responses?.find((r: any) => r.review_id === review.id) || null
            }));
          }
        }

        // Fetch care updates (visible only)
        const { data: careUpdatesData } = await supabase
          .from('care_updates')
          .select('*')
          .eq('pet_id', petId)
          .eq('is_visible', true)
          .order('reported_at', { ascending: false })
          .limit(20);
        
        if (careUpdatesData) {
          setCareUpdates(careUpdatesData);
        }

        setPetData(sanitizedData);
        setRetryCount(0); // Reset retry count on success
      } catch (err) {
        console.error("❌ Error loading pet data:", err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setDebugInfo(prev => [...prev, `Error: ${errorMsg}`]);
        
        // Retry logic for transient failures
        if (retryCount < 2) {
          console.log(`🔄 Retrying... (${retryCount + 1}/2)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * (retryCount + 1)); // Progressive delay
          return;
        }
        
        setError("Failed to load pet profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadPetData();
  }, [petId, retryCount]);

  // Check for add_review parameter
  useEffect(() => {
    const addReviewParam = searchParams.get('add_review');
    if (addReviewParam === 'true') {
      setShowAddReview(true);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading pet profile...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-600">Retrying... ({retryCount}/2)</p>
          )}
          {debugInfo.length > 0 && (
            <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded max-w-md mx-auto">
              {debugInfo.map((info, i) => (
                <div key={i}>{info}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error || !petData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">{error || "The requested pet profile could not be found or is not public."}</p>
          <button 
            onClick={() => {
              setRetryCount(0);
              setIsLoading(true);
              setError(null);
            }}
            className="px-4 py-2 bg-sage-600 text-white rounded hover:bg-sage-700"
          >
            🔄 Try Again
          </button>
          {debugInfo.length > 0 && (
            <details className="text-xs text-gray-500 bg-gray-100 p-2 rounded max-w-md mx-auto">
              <summary className="cursor-pointer">Debug Info</summary>
              {debugInfo.map((info, i) => (
                <div key={i}>{info}</div>
              ))}
            </details>
          )}
        </div>
      </div>
    );
  }

  // Generate meta tags for social sharing
  const profileTitle = `See ${petData.name}'s Profile | PetPort`;
  const profileDescription = petData.bio && petData.bio.trim()
    ? `Meet ${petData.name}! ${petData.bio.slice(0, 150)}${petData.bio.length > 150 ? '...' : ''}`
    : `Meet ${petData.name || 'this pet'}${(petData.species || petData.breed) ? `, a ${petData.species || 'pet'}${petData.breed ? ` (${petData.breed})` : ''}` : ''} on PetPort.`;
  const heroImage = petData.pet_photos?.[0]?.photo_url || petData.gallery_photos?.[0]?.url;
  const profileImage = heroImage || "https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/OG%20General.png";
  const profileUrl = `${window.location.origin}/profile/${petId}`;

  return (
    <>
      <MetaTags
        title={profileTitle}
        description={profileDescription}
        image={profileImage}
        url={profileUrl}
        type="profile"
      />
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
        {/* Close Button */}
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="bg-white/80 hover:bg-white shadow-md"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <header className="text-center mb-8">
            {heroImage && (
              <div className="mb-6">
                <img 
                  src={heroImage} 
                  alt={`${petData.name} profile photo`}
                  loading="lazy"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-sage-200"
                />
              </div>
            )}
            <h1 className="text-3xl font-sans font-bold text-navy-900 mb-2">
              {petData.name}'s Profile
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-2 text-navy-600 mb-2">
              {petData.breed && <Badge variant="secondary">{petData.breed}</Badge>}
              {petData.species && <Badge variant="secondary">{petData.species}</Badge>}
              {petData.age && <Badge variant="secondary">Age: {petData.age}</Badge>}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-navy-600 mb-4">
              {petData.sex && <Badge variant="secondary">Sex: {petData.sex}</Badge>}
              {petData.weight && <Badge variant="secondary">Weight: {petData.weight}</Badge>}
              {petData.height && <Badge variant="secondary">Height: {petData.height}</Badge>}
              {petData.registration_number && <Badge variant="secondary">Registration: {petData.registration_number}</Badge>}
              {petData.microchip_id && <Badge variant="secondary">Microchip: {petData.microchip_id}</Badge>}
              {petData.petport_id && <Badge variant="secondary">ID: {petData.petport_id}</Badge>}
            </div>
            {petData.state && (
              <div className="flex items-center justify-center gap-1 text-sm text-navy-500">
                <MapPin className="w-4 h-4" />
                <span>{petData.state}</span>
              </div>
            )}
          </header>

          {/* Contact Owner Button */}
          <Card className="mb-6 bg-sage-50/50 border-sage-200">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-navy-600 mb-3">
                Have questions about {petData.name}? Send a message to the owner.
              </p>
              <AzureButton 
                onClick={() => setIsContactModalOpen(true)}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Contact Owner
              </AzureButton>
            </CardContent>
          </Card>

          {/* QR Code Section */}
          <PublicPageQRCode
            url={window.location.href}
            petName={petData.name}
            pageType="Profile"
            color="#5691af"
            title={`Scan to View ${petData.name}'s Profile`}
            description="Share this QR code to give instant access to the complete profile"
          />

          {/* Show adoption banner if available for adoption */}
          {petData.adoption_status === 'available' && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-green-800 mb-2">🏠 Available for Adoption!</h3>
                  {petData.adoption_instructions && (
                    <p className="text-green-700">{petData.adoption_instructions}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization Info */}
          {petData.organization_name && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Building className="w-5 h-5 text-primary" />
                  {petData.organization_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 text-sm">
                  {petData.organization_email && (
                    <a href={`mailto:${petData.organization_email}`} className="text-primary hover:underline flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {petData.organization_email}
                    </a>
                  )}
                  {petData.organization_phone && (
                    <a href={`tel:${petData.organization_phone}`} className="text-primary hover:underline flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {petData.organization_phone}
                    </a>
                  )}
                  {petData.organization_website && (
                    <a href={petData.organization_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      Website
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Support Animal Status */}
          {petData.professional_data?.support_animal_status && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🦮</span>
                  <div>
                    <h3 className="font-semibold text-amber-800">Support Animal</h3>
                    <p className="text-amber-700">{petData.professional_data.support_animal_status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Medical Alert - Smaller */}
          {petData.medical?.medical_alert && petData.medical?.medical_conditions && (
             <Alert className="mb-6 border-red-600 bg-red-50">
               <AlertTriangle className="h-5 w-5 text-red-600" />
               <AlertDescription className="ml-2">
                 <strong className="text-red-900">MEDICAL ALERT:</strong>{' '}
                 <span className="text-red-800">{petData.medical.medical_conditions}</span>
               </AlertDescription>
             </Alert>
           )}

          {/* Medical & Health Information - Full Section */}
          {(petData.medical?.medical_conditions || 
            petData.medical?.medications?.length > 0 || 
            petData.medical?.last_vaccination ||
            petData.care_instructions?.allergies ||
            petData.medical?.medical_emergency_document) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  Medical & Health Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {petData.medical?.medical_alert && (
                  <Alert className="border-red-600 bg-red-50">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="ml-2 text-red-900 font-semibold">
                      MEDICAL ALERT
                    </AlertDescription>
                  </Alert>
                )}
                
                {petData.medical?.medical_conditions && (
                  <div>
                    <h4 className="font-medium text-navy-800">Medical Conditions</h4>
                    <p className="text-gray-700">{petData.medical.medical_conditions}</p>
                  </div>
                )}
                
                {petData.medical?.medications && petData.medical.medications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-navy-800">Current Medications</h4>
                    <p className="text-gray-700">{petData.medical.medications.join(', ')}</p>
                  </div>
                )}
                
                {petData.medical?.last_vaccination && (
                  <div>
                    <h4 className="font-medium text-navy-800">Last Vaccination</h4>
                    <p className="text-gray-700">{petData.medical.last_vaccination}</p>
                  </div>
                )}
                
                {petData.care_instructions?.allergies && (
                  <div>
                    <h4 className="font-medium text-navy-800">Allergies</h4>
                    <p className="text-gray-700">{petData.care_instructions.allergies}</p>
                  </div>
                )}
                
                {petData.medical?.medical_emergency_document && (
                  <div>
                    <h4 className="font-medium text-navy-800">Medical Emergency Document</h4>
                    <p className="text-gray-700">{petData.medical.medical_emergency_document}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Care Instructions */}
          {petData.care_instructions && (petData.care_instructions.feeding_schedule || petData.care_instructions.morning_routine || petData.care_instructions.evening_routine || petData.care_instructions.behavioral_notes || petData.care_instructions.favorite_activities || petData.care_instructions.caretaker_notes) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Heart className="w-5 h-5 text-primary" />
                  Care Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {petData.care_instructions.feeding_schedule && (
                  <div>
                    <h4 className="font-medium text-navy-800">Feeding Schedule</h4>
                    <p className="text-gray-700">{petData.care_instructions.feeding_schedule}</p>
                  </div>
                )}
                {petData.care_instructions.morning_routine && (
                  <div>
                    <h4 className="font-medium text-navy-800">Morning Routine</h4>
                    <p className="text-gray-700">{petData.care_instructions.morning_routine}</p>
                  </div>
                )}
                {petData.care_instructions.evening_routine && (
                  <div>
                    <h4 className="font-medium text-navy-800">Evening Routine</h4>
                    <p className="text-gray-700">{petData.care_instructions.evening_routine}</p>
                  </div>
                )}
                {petData.care_instructions.behavioral_notes && (
                  <div>
                    <h4 className="font-medium text-navy-800">Behavioral Notes</h4>
                    <p className="text-gray-700">{petData.care_instructions.behavioral_notes}</p>
                  </div>
                )}
                {petData.care_instructions.favorite_activities && (
                  <div>
                    <h4 className="font-medium text-navy-800">Favorite Activities</h4>
                    <p className="text-gray-700">{petData.care_instructions.favorite_activities}</p>
                  </div>
                )}
                {petData.care_instructions.caretaker_notes && (
                  <div>
                    <h4 className="font-medium text-navy-800">Notes for Sitter/Caretaker</h4>
                    <p className="text-gray-700">{petData.care_instructions.caretaker_notes}</p>
                  </div>
                )}

                {/* Health Monitoring Guidelines */}
                <div className="border-t pt-3 mt-3">
                  <h4 className="font-medium text-navy-800 mb-2">Health Monitoring</h4>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Monitor appetite and water intake daily</li>
                    <li>• Watch for any behavioral changes</li>
                    <li>• Check for signs of distress or discomfort</li>
                    <li>• Contact vet immediately if concerns arise</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Care & Handling Link Card */}
          <Card className="mb-6 bg-gradient-to-r from-sage-50 to-blue-50 border-sage-300">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Stethoscope className="w-6 h-6 text-sage-600" />
                  <h3 className="text-lg font-semibold text-navy-900">Care & Handling Instructions</h3>
                </div>
                <p className="text-sm text-navy-600 max-w-2xl mx-auto">
                  View complete care instructions, post updates about {petData.name}'s care, and leave professional service provider notes. No PetPort account needed!
                </p>
                <Button
                  onClick={() => navigate(`/care/${petId}`)}
                  size="lg"
                  className="bg-sage-600 hover:bg-sage-700 text-white gap-2"
                >
                  <Clock className="w-4 h-4" />
                  View Full Care Instructions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Care Updates Board - Read Only Preview */}
          {careUpdates && careUpdates.length > 0 && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-navy-900">
                        <Clock className="w-5 h-5 text-primary" />
                        Recent Care Updates
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-2">
                        Real-time updates from caretakers, sitters, and service providers
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/care/${petId}`)}
                      className="gap-2"
                    >
                      Post Update
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {careUpdates.slice(0, 3).map((update: any) => (
                      <Card key={update.id} className="bg-sage-50/50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(update.reported_at).toLocaleString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{update.update_text}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {careUpdates.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/care/${petId}`)}
                        className="text-sage-600 hover:text-sage-700"
                      >
                        View all {careUpdates.length} updates →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Service Provider Notes - Read Only Preview */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-navy-900">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      Service Provider Notes
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      Professional notes from vets, trainers, farriers, groomers, and other service providers
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/care/${petId}`)}
                    className="gap-2"
                  >
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ServiceProviderNotesBoard petId={petId!} petName={petData.name} isPublicView={true} />
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/care/${petId}`)}
                    className="text-sage-600 hover:text-sage-700"
                  >
                    View all notes & add your own →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents on File */}
          {petData.documents && petData.documents.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <FileText className="w-5 h-5 text-primary" />
                  Documents on File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-gray-700">Total Documents: {petData.documents.length}</p>
                <div className="space-y-2">
                  {petData.documents.map((document: any, idx: number) => (
                    <div key={idx} className="p-3 rounded border">
                      <div className="font-medium">{document.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <Badge variant="outline" className="mr-2">{document.type}</Badge>
                        {document.upload_date && <span className="mr-2">Uploaded: {document.upload_date}</span>}
                        {document.size && <span>Size: {document.size}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distinctive Features */}
          {petData.lost_pet_data?.[0]?.distinctive_features && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Eye className="w-5 h-5 text-primary" />
                  Distinctive Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{petData.lost_pet_data[0].distinctive_features}</p>
              </CardContent>
            </Card>
          )}

          {/* Description & Unique Traits */}
          {petData.notes && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <FileText className="w-5 h-5 text-primary" />
                  Description & Unique Traits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{petData.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* About Section */}
          {petData.bio && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Heart className="w-5 h-5 text-red-500" />
                  About {petData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{petData.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Add Review Form */}
          {showAddReview && (
            <Card className="mb-6 border-gold-500/30 bg-gold-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Star className="w-5 h-5 text-gold-500" />
                  Leave a Review for {petData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddReviewForm petId={petId!} petName={petData.name} onClose={() => setShowAddReview(false)} />
              </CardContent>
            </Card>
          )}

          {/* Button to Leave Review */}
          {!showAddReview && (
            <div className="text-center mb-6">
              <Button 
                onClick={() => setShowAddReview(true)}
                className="bg-gold-500 hover:bg-gold-600 text-white"
              >
                <Star className="w-4 h-4 mr-2" />
                Leave a Review
              </Button>
            </div>
          )}

          {/* Experience */}
          {petData.experiences && petData.experiences.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Experience & Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {petData.experiences.map((e: any, idx: number) => (
                  <div key={idx} className="p-3 rounded border">
                    <div className="font-medium">{e.activity}</div>
                    {e.description && <div className="text-sm text-muted-foreground">{e.description}</div>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Professional Certifications */}
          {petData.certifications && petData.certifications.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Shield className="w-5 h-5 text-primary" />
                  Professional Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {petData.certifications.map((cert: any, idx: number) => (
                  <div key={idx} className="p-4 rounded border">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="secondary">{cert.type}</Badge>
                      <Badge>{cert.status}</Badge>
                      {cert.certification_number && (
                        <span className="text-sm text-muted-foreground">#{cert.certification_number}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cert.issuer ? `${cert.issuer}` : ''}
                      {cert.issue_date ? ` • Issued: ${new Date(cert.issue_date).toLocaleDateString()}` : ''}
                      {cert.expiry_date ? ` • Expires: ${new Date(cert.expiry_date).toLocaleDateString()}` : ''}
                    </p>
                    {cert.notes && <p className="mt-2 text-sm">{cert.notes}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Training */}
          {petData.training && petData.training.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {petData.training.map((t: any, idx: number) => (
                  <div key={idx} className="p-3 rounded border">
                    <div className="font-medium">{t.course}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.facility ? `${t.facility}` : ''}
                      {t.phone ? ` • ${t.phone}` : ''}
                      {t.completed ? ` • Completed: ${t.completed}` : ''}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {petData.achievements && petData.achievements.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Trophy className="w-5 h-5 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {petData.achievements.map((a: any, idx: number) => (
                  <div key={idx} className="p-3 rounded border">
                    <div className="font-medium">{a.title}</div>
                    {a.description && <div className="text-sm text-muted-foreground">{a.description}</div>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <Star className="w-5 h-5 text-primary" />
                Reviews & References
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Leave a Review Button */}
              {!showAddReview && (
                <div className="text-center mb-6">
                  <Button 
                    onClick={handleOpenReviewForm}
                    className="bg-gold-500 hover:bg-gold-600 text-white"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Leave a Review for {petData.name}
                  </Button>
                </div>
              )}

              {/* Review Form */}
              {showAddReview && (
                <div ref={reviewFormRef} className="mb-6">
                  <Card className="border-gold-500/30 bg-gold-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-navy-900">
                        <Star className="w-5 h-5 text-gold-500" />
                        Leave a Review for {petData.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AddReviewForm 
                        petId={petData.id} 
                        petName={petData.name} 
                        onClose={() => setShowAddReview(false)}
                        onSuccess={handleReviewSuccess}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Existing Reviews */}
              {petData.reviews && petData.reviews.length > 0 ? (
                <div className="space-y-4">
                  {petData.reviews.map((review: any, idx: number) => (
                    <div key={idx} className="p-4 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{review.reviewer_name}</div>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-500 fill-current' : 'text-yellow-300'}`} />
                          ))}
                        </div>
                      </div>
                      {review.text && (
                        <p className="text-sm text-muted-foreground mb-2">{review.text}</p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {review.location && <span>{review.location}</span>}
                        {review.date && <span> • {review.date}</span>}
                      </div>
                      
                      {/* Owner Response */}
                      {review.response && (
                        <div className="mt-3 p-3 bg-azure/5 border-l-4 border-azure rounded-r-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-3 h-3 text-azure mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-azure mb-1">
                                Response from {petData.name}'s Owner
                              </p>
                              <p className="text-sm text-gray-700">{review.response.response_text}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    No reviews yet. Be the first to share your experience with {petData.name}!
                  </p>
                  {!showAddReview && (
                    <Button 
                      onClick={handleOpenReviewForm}
                      className="bg-gold-500 hover:bg-gold-600 text-white"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Write First Review
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Travel History */}
          {petData.travel_locations && petData.travel_locations.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Plane className="w-5 h-5 text-primary" />
                  Travel History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {petData.travel_locations.map((location: any, idx: number) => (
                  <div key={idx} className="p-3 rounded border">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge variant="outline" className="mr-2">{location.type}</Badge>
                          {location.code && <span className="mr-2">Code: {location.code}</span>}
                          {location.date_visited && <span>Visited: {location.date_visited}</span>}
                        </div>
                        {location.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{location.notes}</p>
                        )}
                      </div>
                      {location.photo_url && (
                        <img 
                          src={location.photo_url} 
                          alt={location.name}
                          className="w-16 h-16 rounded object-cover ml-3"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Photo Gallery */}
          {petData.gallery_photos && petData.gallery_photos.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Camera className="w-5 h-5 text-primary" />
                  Photo Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {petData.gallery_photos.map((photo: any, idx: number) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={photo.url} 
                        alt={photo.caption || `${petData.name} photo ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-sage-200"
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map Pins */}
          {petData.map_pins && petData.map_pins.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <MapPin className="w-5 h-5 text-primary" />
                  Important Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {petData.map_pins.map((pin: any, idx: number) => (
                  <div key={idx} className="p-3 rounded border">
                    <div className="font-medium">{pin.title || pin.category}</div>
                    {pin.description && <div className="text-sm text-muted-foreground">{pin.description}</div>}
                    {pin.category && pin.title && (
                      <div className="text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-xs">{pin.category}</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm pb-8">
            <div className="border-t border-sage-200 mb-6 max-w-md mx-auto" />
            <p>This is a public profile for {petData.name}.</p>
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
        </main>
      </div>

      <ContactOwnerModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        petId={petData.id}
        petName={petData.name}
        pageType="profile"
      />
    </>
  );
};

export default PublicProfile;