
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchPetDetails } from "@/services/petService";
import { Heart, MapPin, Phone, Calendar, Star, Award, GraduationCap, Plane } from "lucide-react";

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
        const data = await fetchPetDetails(petId);
        if (data) {
          setPetData(data);
        } else {
          setError("Pet profile not found");
        }
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
          <p className="text-gray-600">{error || "The requested pet profile could not be found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🐾</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PetPass Public Profile</h1>
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
              {petData.photoUrl && (
                <div className="flex-shrink-0">
                  <img 
                    src={petData.photoUrl} 
                    alt={petData.name}
                    className="w-48 h-48 object-cover rounded-full border-4 border-blue-200"
                  />
                </div>
              )}
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
                  {petData.petPassId && (
                    <div className="flex items-center space-x-2">
                      <span className="w-4 h-4 text-blue-600">🆔</span>
                      <span>{petData.petPassId}</span>
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
        {petData.supportAnimalStatus && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🦮</span>
                <div>
                  <h3 className="font-semibold text-amber-800">Support Animal</h3>
                  <p className="text-amber-700">{petData.supportAnimalStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Medical Alert */}
        {petData.medicalAlert && petData.medicalConditions && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-red-800">Medical Alert</h3>
                  <p className="text-red-700">{petData.medicalConditions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {petData.emergencyContact && (
                <div>
                  <p className="font-medium text-gray-700">Primary Emergency</p>
                  <p className="text-gray-600">{petData.emergencyContact}</p>
                </div>
              )}
              {petData.secondEmergencyContact && (
                <div>
                  <p className="font-medium text-gray-700">Secondary Emergency</p>
                  <p className="text-gray-600">{petData.secondEmergencyContact}</p>
                </div>
              )}
              {petData.vetContact && (
                <div>
                  <p className="font-medium text-gray-700">Veterinarian</p>
                  <p className="text-gray-600">{petData.vetContact}</p>
                </div>
              )}
              {petData.petCaretaker && (
                <div>
                  <p className="font-medium text-gray-700">Pet Caretaker</p>
                  <p className="text-gray-600">{petData.petCaretaker}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badges & Certifications */}
          {petData.badges && petData.badges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Badges & Certifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {petData.badges.map((badge: string, index: number) => (
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
                        <h4 className="font-medium">{review.reviewerName}</h4>
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

          {/* Training */}
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

          {/* Travel History */}
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
        </div>

        {/* Gallery */}
        {petData.gallery_photos && petData.gallery_photos.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-xl">📷</span>
                <span>Photo Gallery</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {petData.gallery_photos.slice(0, 8).map((photo: any, index: number) => (
                  <div key={index} className="aspect-square">
                    <img 
                      src={photo.url} 
                      alt={photo.caption || `Gallery photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    {photo.caption && (
                      <p className="text-xs text-gray-600 mt-1 text-center">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <Separator className="mb-4" />
          <p>This is a public read-only profile for {petData.name}</p>
          <p>Generated by PetPass • {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
