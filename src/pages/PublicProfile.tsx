import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MapPin, Phone, Star, Award, GraduationCap, Plane, Trophy, Briefcase, Shield, Building, Mail, Globe, Camera } from "lucide-react";

import { MetaTags } from "@/components/MetaTags";
import { AddReviewForm } from "@/components/AddReviewForm";
import { sanitizeText, sanitizeHtml } from "@/utils/inputSanitizer";

const PublicProfile = () => {
  const { petId } = useParams<{ petId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [petData, setPetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);

  useEffect(() => {
    const loadPetData = async () => {
      if (!petId) {
        setError("Pet ID not provided");
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
            medical_conditions: sanitizeText(data.medical.medical_conditions || '')
          } : null,
          reviews: data.reviews?.map((review: any) => ({
            ...review,
            reviewer_name: sanitizeText(review.reviewer_name || ''),
            text: sanitizeText(review.text || ''),
            location: sanitizeText(review.location || ''),
            type: sanitizeText(review.type || '')
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
          experiences: data.experiences?.map((experience: any) => ({
            ...experience,
            activity: sanitizeText(experience.activity || ''),
            description: sanitizeText(experience.description || '')
          })) || []
        };

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
  const profileTitle = `${petData.name} - PetPort Profile`;
  const profileDescription = petData.bio 
    ? `Meet ${petData.name}! ${petData.bio.slice(0, 150)}${petData.bio.length > 150 ? '...' : ''}`
    : `Meet ${petData.name}, a ${petData.species || 'pet'}${petData.breed ? ` (${petData.breed})` : ''} on PetPort.`;
  const heroImage = petData.pet_photos?.[0]?.photo_url || petData.gallery_photos?.[0]?.url;
  const profileImage = heroImage;
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

          {/* Medical Alert */}
          {petData.medical?.medical_alert && petData.medical?.medical_conditions && (
             <Card className="mb-6 border-primary/20 bg-primary/10">
               <CardContent className="p-6">
                 <div className="flex items-center space-x-3">
                   <span className="text-2xl">⚠️</span>
                   <div>
                     <h3 className="font-semibold text-primary">Medical Alert</h3>
                     <p className="text-primary">{petData.medical.medical_conditions}</p>
                  </div>
                </div>
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

          {/* Reviews */}
          {petData.reviews && petData.reviews.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Star className="w-5 h-5 text-primary" />
                  Reviews & References
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

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
    </>
  );
};

export default PublicProfile;