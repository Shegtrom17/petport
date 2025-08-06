
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import worldMapOutline from "@/assets/world-map-outline.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MapPin, Phone, Calendar, Star, Award, GraduationCap, Plane, Trophy, Briefcase, Shield } from "lucide-react";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { sanitizeText, sanitizeHtml } from "@/utils/inputSanitizer";

const PublicProfile = () => {
  const { petId } = useParams<{ petId: string }>();
  const [petData, setPetData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPetData = async () => {
      if (!petId) {
        setError("Pet ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch public pet data using the new RLS policy
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
            certifications (*),
            map_pins (*)
          `)
          .eq('id', petId)
          .eq('is_public', true)
          .maybeSingle();

        if (fetchError || !data) {
          setError("Pet profile not found or not public");
          setIsLoading(false);
          return;
        }

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
            support_animal_status: sanitizeText(data.professional_data.support_animal_status || ''),
            badges: data.professional_data.badges?.map((badge: string) => sanitizeText(badge)) || []
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
          })) || [],
          certifications: Array.isArray(data.certifications) ? data.certifications.map((cert: any) => ({
            ...cert,
            type: sanitizeText(cert.type || ''),
            issuer: sanitizeText(cert.issuer || ''),
            certification_number: sanitizeText(cert.certification_number || '')
          })) : []
        };

        setPetData(sanitizedData);
      } catch (err) {
        console.error("Error loading pet data:", err);
        setError("Failed to load pet profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadPetData();
  }, [petId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading pet profile...</p>
        </div>
      </div>
    );
  }

  if (error || !petData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">{error || "The requested pet profile could not be found or is not public."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 passport-map-container">
      <div className="passport-map-bg" />
      {/* Header */}
      <div className="bg-white shadow-sm border-b relative passport-map-container">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 70%, rgba(255,255,255,0.2) 100%),
              url(${worldMapOutline}),
              linear-gradient(45deg, transparent 48%, rgba(160, 82, 45, 0.12) 49%, rgba(160, 82, 45, 0.12) 51%, transparent 52%),
              linear-gradient(45deg, rgba(205, 133, 63, 0.04) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(222, 184, 135, 0.04) 25%, transparent 25%)
            `,
            backgroundSize: '100% 100%, contain, 8px 8px, 6px 6px, 6px 6px',
            backgroundPosition: 'center, center, 0 0, 0 0, 0 3px',
            backgroundRepeat: 'no-repeat, no-repeat, repeat, repeat, repeat',
            opacity: 0.15,
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
        <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PetPort Public Profile</h1>
              <p className="text-gray-600">Read-only pet information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Pet Header */}
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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{petData.name}</h1>
                <p className="text-xl text-gray-600 mb-4">
                  {petData.species && petData.species.charAt(0).toUpperCase() + petData.species.slice(1)}
                  {petData.breed && ` • ${petData.breed}`}
                </p>
                
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

        {/* Social Sharing */}
        <div className="mb-6">
          <SocialShareButtons 
            petName={petData.name}
            petId={petId || ""}
            isMissingPet={false}
          />
        </div>

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
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-red-800">Medical Alert</h3>
                  <p className="text-red-700">{petData.medical.medical_conditions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information - Limited for privacy */}
          <Card>
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

          {/* Badges & Certifications */}
          {petData.professional_data?.badges && petData.professional_data.badges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Badges & Certifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {petData.professional_data.badges.map((badge: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      🏅 {badge}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          {petData.reviews && petData.reviews.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Reviews & References</span>
                </CardTitle>
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

          {/* Certifications */}
          {petData.certifications && petData.certifications.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Certifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {petData.certifications.slice(0, 6).map((cert: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{cert.type}</h4>
                        <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                          {cert.status}
                        </Badge>
                      </div>
                      {cert.issuer && <p className="text-sm text-gray-600 mb-1">🏢 {cert.issuer}</p>}
                      {cert.certification_number && <p className="text-sm text-gray-600 mb-1">📄 {cert.certification_number}</p>}
                      <div className="text-sm text-gray-500 space-x-4">
                        {cert.issue_date && <span>📅 Issued: {cert.issue_date}</span>}
                        {cert.expiry_date && <span>⏰ Expires: {cert.expiry_date}</span>}
                      </div>
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

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <Separator className="mb-4" />
          <p>This is a public read-only profile for {petData.name}</p>
          <p>Generated by PetPort • {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
