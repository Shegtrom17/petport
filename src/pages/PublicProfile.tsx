
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import worldMapOutline from "@/assets/world-map-outline.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MapPin, Phone, Calendar, Star, Award, GraduationCap, Plane, Trophy, Briefcase, Shield, Building, Mail, Globe } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">{error || "The requested pet profile could not be found or is not public."}</p>
          <button 
            onClick={() => {
              setRetryCount(0);
              setIsLoading(true);
              setError(null);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 passport-map-container">
      <div className="passport-map-bg" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with centered photo - like other shareable pages */}
        <div className="text-center mb-8">
          {heroImage && (
            <div className="mb-6">
              <img 
                src={heroImage} 
                alt={`${petData.name} profile photo`}
                loading="lazy"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-200"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{petData.name}</h1>
          <p className="text-xl text-gray-600 mb-6">
            {petData.species && petData.species.charAt(0).toUpperCase() + petData.species.slice(1)}
            {petData.breed && ` • ${petData.breed}`}
          </p>
        </div>

        {/* Pet Details Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex space-x-4">
                {petData.pet_photos?.[0]?.photo_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={petData.pet_photos[0].photo_url} 
                      alt={`${petData.name} profile`}
                      className="w-48 h-48 object-cover rounded-full border-4 border-blue-200"
                    />
                  </div>
                )}
                {petData.pet_photos?.[0]?.full_body_photo_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={petData.pet_photos[0].full_body_photo_url} 
                      alt={`${petData.name} full body`}
                      className="w-36 h-48 object-cover rounded-lg border-4 border-blue-200"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                {/* Show adoption banner if available for adoption */}
                {petData.adoption_status === 'available' && (
                  <div className="bg-green-100 border border-green-300 text-green-800 text-center py-3 px-4 rounded-lg mb-4 shadow-sm">
                    <p className="text-lg font-bold">🏠 Available for Adoption!</p>
                    {petData.adoption_instructions && (
                      <p className="text-sm mt-1">{petData.adoption_instructions}</p>
                    )}
                  </div>
                )}

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">About {petData.name}</h2>

                {/* Organization Info */}
                {petData.organization_name && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      {petData.organization_name}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {petData.organization_email && (
                        <a href={`mailto:${petData.organization_email}`} className="text-blue-600 hover:text-blue-800 underline flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {petData.organization_email}
                        </a>
                      )}
                      {petData.organization_phone && (
                        <div className="flex flex-col">
                          <a href={`tel:${petData.organization_phone}`} className="text-blue-600 hover:text-blue-800 underline flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {petData.organization_phone}
                          </a>
                          <span className="text-xs text-blue-500 ml-5">Tap to call</span>
                        </div>
                      )}
                      {petData.organization_website && (
                        <a href={petData.organization_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline flex items-center">
                          <Globe className="w-4 h-4 mr-1" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {petData.age && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{petData.age}</span>
                    </div>
                  )}
                  {petData.weight && (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 text-blue-600">⚖️</span>
                      <span>{petData.weight}</span>
                    </div>
                  )}
                  {petData.sex && (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 text-blue-600">♂♀</span>
                      <span>{petData.sex}</span>
                    </div>
                  )}
                  {petData.state && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{petData.state}</span>
                    </div>
                  )}
                  {petData.petport_id && (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 text-blue-600">🆔</span>
                      <span>{petData.petport_id}</span>
                    </div>
                  )}
                  {petData.microchip_id && (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 text-blue-600">🔘</span>
                      <span>{petData.microchip_id}</span>
                    </div>
                  )}
                  {petData.registration_number && (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 text-blue-600">📋</span>
                      <span>{petData.registration_number}</span>
                    </div>
                  )}
                </div>

                {petData.bio && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-gray-700 italic">"{petData.bio}"</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


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

        {/* Add Review Form */}
        {showAddReview && (
          <div className="mb-8">
            <AddReviewForm
              petId={petId!}
              petName={petData.name}
              onClose={() => {
                setShowAddReview(false);
                // Remove the add_review parameter from URL
                searchParams.delete('add_review');
                setSearchParams(searchParams, { replace: true });
              }}
              onSuccess={() => {
                setShowAddReview(false);
                // Remove the add_review parameter from URL
                searchParams.delete('add_review');
                setSearchParams(searchParams, { replace: true });
                // Refresh pet data to show new review
                setRetryCount(prev => prev + 1);
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Reviews */}
          {petData.reviews && petData.reviews.length > 0 && (
            <Card className="lg:col-span-2">
               <CardHeader>
                 <div className="flex items-center justify-between">
                   <CardTitle className="flex items-center space-x-2">
                     <Star className="w-5 h-5" />
                     <span>Reviews & References</span>
                   </CardTitle>
                   {!showAddReview && (
                     <Button
                       onClick={() => setShowAddReview(true)}
                       className="text-white hover:opacity-90"
                       style={{ backgroundColor: '#5691af' }}
                     >
                       <Star className="w-4 h-4 mr-2" />
                       Leave a Review
                     </Button>
                   )}
                 </div>
               </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {petData.reviews.slice(0, 6).map((review: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{review.reviewer_name}</h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.text && <p className="text-gray-600 mb-2">"{review.text}"</p>}
                      <div className="text-sm text-gray-500 space-x-4">
                        {review.date && <span>📅 {review.date}</span>}
                        {review.location && <span>📍 {review.location}</span>}
                        {review.type && <span>🏷️ {review.type}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {petData.training && petData.training.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Training & Education</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {petData.training.slice(0, 5).map((course: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium">{course.course}</h4>
                      {course.facility && <p className="text-sm text-gray-600">🏢 {course.facility}</p>}
                      {course.completed && <p className="text-sm text-gray-600">✅ Completed: {course.completed}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {petData.travel_locations && petData.travel_locations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5" />
                  <span>Travel History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {petData.travel_locations.slice(0, 5).map((location: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-sm text-gray-600">🏷️ {location.type}</p>
                      {location.date_visited && <p className="text-sm text-gray-600">📅 {location.date_visited}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {petData.achievements && petData.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {petData.achievements.slice(0, 5).map((achievement: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium">{achievement.title}</h4>
                      {achievement.description && <p className="text-sm text-gray-600">{achievement.description}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Experiences */}
          {petData.experiences && petData.experiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Professional Experience</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {petData.experiences.slice(0, 5).map((experience: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <h4 className="font-medium">{experience.activity}</h4>
                      {experience.description && <p className="text-sm text-gray-600">{experience.description}</p>}
                      {experience.contact && <p className="text-sm text-gray-500">📞 {experience.contact}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {petData.gallery_photos && petData.gallery_photos.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">📷</span>
                  <span>Photo Gallery</span>
                </div>
                <Badge variant="outline">
                  {petData.gallery_photos.length} photo{petData.gallery_photos.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {petData.gallery_photos.slice(0, 16).map((photo: any, index: number) => (
                  <div key={index} className="aspect-square group cursor-pointer">
                    <img 
                      src={photo.url} 
                      alt={photo.caption ? `Gallery photo: ${photo.caption}` : `Gallery photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                    />
                    {photo.caption && (
                      <p className="text-xs text-gray-600 mt-1 text-center">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
              {petData.gallery_photos.length > 16 && (
                <div className="mt-4 text-center">
                  <Badge variant="secondary">
                    +{petData.gallery_photos.length - 16} more photos
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}


        {/* Emergency Contact Available */}
        <Card className="mt-6 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Emergency Contact Available</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              Emergency contact information is available to authorized personnel and veterinarians.
              Contact information is protected for privacy and safety.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <Separator className="mb-4" />
          <p>This is a public read-only profile for {petData.name}.</p>
          <p>
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
    </>
  );
};

export default PublicProfile;
