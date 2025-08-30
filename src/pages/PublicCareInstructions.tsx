import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Heart, AlertTriangle, Phone, MapPin } from "lucide-react";
import { fetchPetDetails } from '@/services/petService';
import { fetchCareInstructions } from '@/services/careInstructionsService';
import { supabase } from "@/integrations/supabase/client";
import { MetaTags } from "@/components/MetaTags";

interface Pet {
  id: string;
  name: string;
  breed: string;
  species: string;
  age: string;
  weight: string;
  state: string;
  county: string;
  is_public: boolean;
  emergencyContact?: string;
  secondEmergencyContact?: string;
  vetContact?: string;
  petCaretaker?: string;
  medications?: string[];
  daily_routine?: string;
}

interface CareData {
  feeding_schedule?: string;
  morning_routine?: string;
  evening_routine?: string;
  allergies?: string;
  behavioral_notes?: string;
  favorite_activities?: string;
}

const PublicCareInstructions = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [careData, setCareData] = useState<CareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isValidUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  // Redirect logged-in owners if invalid petId is used (e.g., '/care/:petId')
  useEffect(() => {
    const attemptRedirect = async () => {
      if (!petId || petId.startsWith(':') || !isValidUUID(petId)) {
        console.warn('[PublicCareInstructions] Invalid petId param', { petId, path: window.location.pathname });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data, error } = await supabase
              .from('pets')
              .select('id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: true })
              .limit(1);
            if (!error && data && data.length > 0) {
              navigate(`/care/${data[0].id}`, { replace: true });
              return;
            }
          }
        } catch (e) {
          console.warn('[PublicCareInstructions] Redirect check failed', e);
        }
      }
    };
    attemptRedirect();
  }, [petId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!petId || petId.startsWith(':') || !isValidUUID(petId)) {
        setError('Invalid or missing pet ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch pet details
        const petDetails = await fetchPetDetails(petId);
        if (!petDetails) {
          setError('Pet profile not found');
          setLoading(false);
          return;
        }

        // Check if pet profile is public
        if (!petDetails.is_public) {
          setError('This pet profile is not publicly accessible');
          setLoading(false);
          return;
        }

        setPet(petDetails);

        // Fetch care instructions
        const careInstructions = await fetchCareInstructions(petId);
        setCareData(careInstructions);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load care instructions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petId]);

  // Realtime updates for care instructions
  useEffect(() => {
    if (!petId || petId.startsWith(':') || !isValidUUID(petId)) return;

    const channel = supabase
      .channel('care-instructions-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'care_instructions',
        filter: `pet_id=eq.${petId}`,
      }, async () => {
        try {
          const updated = await fetchCareInstructions(petId);
          setCareData(updated);
        } catch (e) {
          console.error('Realtime care update fetch failed:', e);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p className="text-sage-600">Loading care instructions...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-navy-900 mb-2">
              {error || 'Care Instructions Not Available'}
            </h2>
            <p className="text-navy-600">
              {error === 'Invalid or missing pet ID' && 'This care link is invalid or incomplete. Please use the correct link from your pet\'s page.'}
              {error === 'Pet ID is missing' && 'The pet ID is missing from the URL.'}
              {error === 'Pet profile not found' && 'The pet profile you\'re looking for doesn\'t exist.'}
              {error === 'This pet profile is not publicly accessible' && 'This pet\'s care instructions are private.'}
              {error === 'Failed to load care instructions' && 'There was an error loading the care instructions. Please try again later.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const extractPhoneNumber = (contactString: string): string | null => {
    if (!contactString) return null;
    const phoneMatch = contactString.match(/\(?\d{3}\)?\s?-?\d{3}-?\d{4}/);
    return phoneMatch ? phoneMatch[0] : null;
  };

  const formatPhoneForTel = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
      <MetaTags 
        title={`${pet.name} Care Instructions | PetPort`}
        description={`Live care plan for ${pet.name}: feeding, routines, and important notes.`}
        url={`${window.location.origin}/care/${pet.id}`}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-navy-900 mb-2">
            {pet.name}'s Care Instructions
          </h1>
          <div className="flex items-center justify-center gap-2 text-navy-600 mb-4">
            {pet.breed && <Badge variant="secondary">{pet.breed}</Badge>}
            {pet.species && <Badge variant="secondary">{pet.species}</Badge>}
            {pet.age && <Badge variant="secondary">{pet.age}</Badge>}
          </div>
          {(pet.state || pet.county) && (
            <div className="flex items-center justify-center gap-1 text-sm text-navy-500">
              <MapPin className="w-4 h-4" />
              <span>{[pet.county, pet.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {/* Emergency Contacts */}
          {(pet.emergencyContact || pet.secondEmergencyContact || pet.vetContact || pet.petCaretaker) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Phone className="w-5 h-5 text-red-600" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pet.emergencyContact && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-800 mb-2">Primary Emergency Contact</h4>
                    {extractPhoneNumber(pet.emergencyContact) ? (
                      <div>
                        <a 
                          href={`tel:${formatPhoneForTel(extractPhoneNumber(pet.emergencyContact)!)}`}
                          className="text-red-700 hover:text-red-900 font-medium"
                          aria-label="Call primary emergency contact"
                        >
                          {pet.emergencyContact}
                        </a>
                        <p className="text-xs text-red-600 mt-1">Tap to call</p>
                      </div>
                    ) : (
                      <p className="text-red-700">{pet.emergencyContact}</p>
                    )}
                  </div>
                )}
                
                {pet.secondEmergencyContact && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-medium text-amber-800 mb-2">Secondary Emergency Contact</h4>
                    {extractPhoneNumber(pet.secondEmergencyContact) ? (
                      <div>
                        <a 
                          href={`tel:${formatPhoneForTel(extractPhoneNumber(pet.secondEmergencyContact)!)}`}
                          className="text-amber-700 hover:text-amber-900 font-medium"
                          aria-label="Call secondary emergency contact"
                        >
                          {pet.secondEmergencyContact}
                        </a>
                        <p className="text-xs text-amber-600 mt-1">Tap to call</p>
                      </div>
                    ) : (
                      <p className="text-amber-700">{pet.secondEmergencyContact}</p>
                    )}
                  </div>
                )}

                {pet.vetContact && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">Veterinarian</h4>
                    {extractPhoneNumber(pet.vetContact) ? (
                      <div>
                        <a 
                          href={`tel:${formatPhoneForTel(extractPhoneNumber(pet.vetContact)!)}`}
                          className="text-blue-700 hover:text-blue-900 font-medium"
                          aria-label="Call veterinarian"
                        >
                          {pet.vetContact}
                        </a>
                        <p className="text-xs text-blue-600 mt-1">Tap to call</p>
                      </div>
                    ) : (
                      <p className="text-blue-700">{pet.vetContact}</p>
                    )}
                  </div>
                )}

                {pet.petCaretaker && (
                  <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
                    <h4 className="font-medium text-sage-800 mb-2">Pet Caretaker</h4>
                    {extractPhoneNumber(pet.petCaretaker) ? (
                      <div>
                        <a 
                          href={`tel:${formatPhoneForTel(extractPhoneNumber(pet.petCaretaker)!)}`}
                          className="text-sage-700 hover:text-sage-900 font-medium"
                          aria-label="Call pet caretaker"
                        >
                          {pet.petCaretaker}
                        </a>
                        <p className="text-xs text-sage-600 mt-1">Tap to call</p>
                      </div>
                    ) : (
                      <p className="text-sage-700">{pet.petCaretaker}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Daily Care Schedule */}
          {(careData?.feeding_schedule || careData?.morning_routine || careData?.evening_routine || pet.daily_routine) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Clock className="w-5 h-5 text-sage-600" />
                  Daily Care Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pet.daily_routine && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Daily Routine & Preferences
                    </h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {pet.daily_routine}
                    </p>
                  </div>
                )}

                {careData.morning_routine && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Morning Routine
                    </h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {careData.morning_routine}
                    </p>
                  </div>
                )}
                
                {careData.feeding_schedule && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Feeding Schedule
                    </h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {careData.feeding_schedule}
                    </p>
                  </div>
                )}

                {careData.evening_routine && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Evening Routine
                    </h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {careData.evening_routine}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Medications & Health */}
          {pet.medications && pet.medications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Heart className="w-5 h-5 text-red-600" />
                  Medications & Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pet.medications.map((med, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">{med}</span>
                    </div>
                    <p className="text-xs text-red-700">Administer as prescribed. Contact vet if reactions occur.</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Important Notes */}
          {(careData?.allergies || careData?.behavioral_notes || careData?.favorite_activities) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {careData.allergies && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2">Allergies & Sensitivities</h4>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-amber-800 leading-relaxed whitespace-pre-wrap">
                        {careData.allergies}
                      </p>
                    </div>
                  </div>
                )}

                {careData.behavioral_notes && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2">Behavioral Notes</h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {careData.behavioral_notes}
                    </p>
                  </div>
                )}

                {careData.favorite_activities && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2">Favorite Activities</h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {careData.favorite_activities}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Separator className="mb-6" />
          <p className="text-sm text-navy-500">
            This care information is provided by {pet.name}'s owner via PetPort
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicCareInstructions;