import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import worldMapOutline from "@/assets/world-map-outline.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MapPin, Phone, Shield, Building, Mail, Globe, AlertTriangle } from "lucide-react";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { MetaTags } from "@/components/MetaTags";
import { sanitizeText } from "@/utils/inputSanitizer";
import { getOrderedContacts } from "@/utils/contactUtils";

const PublicEmergencyProfile = () => {
  const { petId } = useParams<{ petId: string }>();
  const [petData, setPetData] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadPetData = async () => {
      if (!petId) {
        setError("Pet ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Loading emergency profile for pet:', petId);
        
        // Fetch only essential emergency data
        const { data, error: fetchError } = await supabase
          .from('pets')
          .select(`
            id,
            name,
            species,
            breed,
            age,
            weight,
            state,
            petport_id,
            microchip_id,
            pet_photos (photo_url),
            medical (medical_alert, medical_conditions),
            organization_name,
            organization_email,
            organization_phone,
            organization_website
          `)
          .eq('id', petId)
          .eq('is_public', true)
          .maybeSingle();

        if (fetchError) {
          console.error('❌ Supabase fetch error:', fetchError);
          throw fetchError;
        }

        if (!data) {
          console.warn('⚠️ No data returned for pet:', petId);
          setError("Emergency profile not found or not public");
          setIsLoading(false);
          return;
        }

        console.log('✅ Emergency pet data loaded successfully:', data.name);

        // Sanitize text data
        const sanitizedData = {
          ...data,
          name: sanitizeText(data.name || ''),
          breed: sanitizeText(data.breed || ''),
          species: sanitizeText(data.species || ''),
          age: sanitizeText(data.age || ''),
          weight: sanitizeText(data.weight || ''),
          state: sanitizeText(data.state || ''),
          petport_id: sanitizeText(data.petport_id || ''),
          microchip_id: sanitizeText(data.microchip_id || ''),
          medical: data.medical ? {
            ...data.medical,
            medical_conditions: sanitizeText(data.medical.medical_conditions || '')
          } : null
        };

        setPetData(sanitizedData);
        
        // Fetch emergency contacts separately
        try {
          const emergencyContacts = await getOrderedContacts(petId);
          setContacts(emergencyContacts.filter(contact => !contact.isEmpty));
        } catch (contactError) {
          console.warn('Could not load emergency contacts:', contactError);
          setContacts([]);
        }
        
        setRetryCount(0);
      } catch (err) {
        console.error("❌ Error loading emergency pet data:", err);
        
        if (retryCount < 2) {
          console.log(`🔄 Retrying... (${retryCount + 1}/2)`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * (retryCount + 1));
          return;
        }
        
        setError("Failed to load emergency profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadPetData();
  }, [petId, retryCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading emergency profile...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-600">Retrying... ({retryCount}/2)</p>
          )}
        </div>
      </div>
    );
  }

  if (error || !petData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Emergency Profile Not Found</h1>
          <p className="text-gray-600">{error || "The requested emergency profile could not be found or is not public."}</p>
          <button 
            onClick={() => {
              setRetryCount(0);
              setIsLoading(true);
              setError(null);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Generate meta tags for emergency profile sharing
  const profileTitle = `${petData.name} - Emergency Profile`;
  const profileDescription = `Emergency contact information for ${petData.name}, a ${petData.species || 'pet'}${petData.breed ? ` (${petData.breed})` : ''}`;
  const profileImage = petData.pet_photos?.[0]?.photo_url;
  const profileUrl = `${window.location.origin}/emergency/${petId}`;

  return (
    <>
      <MetaTags
        title={profileTitle}
        description={profileDescription}
        image={profileImage}
        url={profileUrl}
        type="profile"
      />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
        {/* Emergency Header */}
        <div className="bg-red-600 text-white shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Emergency Profile</h1>
                <p className="text-red-100">Essential contact and medical information</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Pet Emergency Header */}
          <Card className="mb-8 border-red-200">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {petData.pet_photos?.[0]?.photo_url && (
                  <div className="flex-shrink-0">
                    <img 
                      src={petData.pet_photos[0].photo_url} 
                      alt={`${petData.name} emergency photo`}
                      className="w-48 h-48 object-cover rounded-full border-4 border-red-200"
                    />
                  </div>
                )}
                <div className="flex-1 text-center md:text-left">
                  <div className="bg-red-100 border border-red-300 text-red-800 text-center py-3 px-4 rounded-lg mb-4">
                    <h2 className="text-lg font-bold">🚨 EMERGENCY CONTACT INFO</h2>
                  </div>

                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{petData.name}</h1>
                  <p className="text-xl text-gray-600 mb-4">
                    {petData.species && petData.species.charAt(0).toUpperCase() + petData.species.slice(1)}
                    {petData.breed && ` • ${petData.breed}`}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {petData.age && (
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 text-red-600">📅</span>
                        <span>{petData.age}</span>
                      </div>
                    )}
                    {petData.weight && (
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 text-red-600">⚖️</span>
                        <span>{petData.weight}</span>
                      </div>
                    )}
                    {petData.state && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span>{petData.state}</span>
                      </div>
                    )}
                    {(petData.petport_id || petData.microchip_id) && (
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 text-red-600">🆔</span>
                        <span>{petData.petport_id || petData.microchip_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Contact */}
          {petData.organization_name && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-blue-800">
                  <Building className="w-5 h-5 mr-2" />
                  Organization Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-blue-800 mb-3">{petData.organization_name}</h3>
                <div className="space-y-2">
                  {petData.organization_phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <a href={`tel:${petData.organization_phone}`} className="text-blue-600 hover:text-blue-800 underline font-medium">
                        {petData.organization_phone}
                      </a>
                      <span className="text-xs text-blue-500">(Tap to call)</span>
                    </div>
                  )}
                  {petData.organization_email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <a href={`mailto:${petData.organization_email}`} className="text-blue-600 hover:text-blue-800 underline">
                        {petData.organization_email}
                      </a>
                    </div>
                  )}
                  {petData.organization_website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <a href={petData.organization_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contacts */}
          {contacts && contacts.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-red-600">
                  <Phone className="w-5 h-5 mr-2" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.map((contact: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{contact.label || 'Contact'}</p>
                          {contact.name && (
                            <p className="text-gray-700">{contact.name}</p>
                          )}
                        </div>
                        {contact.phone && (
                          <div className="text-right">
                            <a 
                              href={`tel:${contact.phone}`}
                              className="text-red-600 hover:text-red-800 underline font-medium"
                            >
                              {contact.phone}
                            </a>
                            <p className="text-xs text-gray-500">Tap to call</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Sharing */}
          <div className="mb-6">
            <SocialShareButtons 
              petName={petData.name}
              petId={petId || ""}
              isMissingPet={false}
            />
          </div>

          {/* Emergency Instructions */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-red-800 mb-2">📋 This is an Emergency Profile</h3>
              <p className="text-red-700 text-sm">
                This page contains only essential emergency contact and medical information. 
                For complete pet information, visit the full profile.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm pb-8">
            <div className="border-t border-red-200 mb-6 max-w-md mx-auto" />
            <p>This is an emergency profile for {petData.name}.</p>
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
    </>
  );
};

export default PublicEmergencyProfile;