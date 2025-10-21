import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Heart, AlertTriangle, MapPin, Pill, Sparkles, Mail, MessageCircle, Send, Loader2 } from "lucide-react";
import { fetchPetDetails } from '@/services/petService';
import { fetchCareInstructions } from '@/services/careInstructionsService';
import { supabase } from "@/integrations/supabase/client";
import { MetaTags } from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { AzureButton } from "@/components/ui/azure-button";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { ContactOwnerModal } from "@/components/ContactOwnerModal";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Pet {
  id: string;
  name: string;
  breed: string;
  species: string;
  age: string;
  weight: string;
  height?: string;
  sex?: string;
  microchipId?: string;
  registrationNumber?: string;
  state: string;
  county: string;
  is_public: boolean;
  medications?: string[];
  daily_routine?: string;
  photoUrl?: string;
}


interface CareData {
  feeding_schedule?: string;
  morning_routine?: string;
  evening_routine?: string;
  allergies?: string;
  behavioral_notes?: string;
  favorite_activities?: string;
  caretaker_notes?: string;
}

interface MedicalData {
  medical_conditions?: string;
  medical_alert?: boolean;
  last_vaccination?: string;
  medical_emergency_document?: string;
}

interface CareUpdate {
  id: string;
  pet_id: string;
  update_text: string;
  reported_at: string;
  is_visible: boolean;
}

const PublicCareInstructions = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [careData, setCareData] = useState<CareData | null>(null);
  const [medicalData, setMedicalData] = useState<MedicalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [careUpdates, setCareUpdates] = useState<CareUpdate[]>([]);
  const [updateText, setUpdateText] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  const isValidUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const fetchCareUpdates = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('care_updates')
        .select('*')
        .eq('pet_id', id)
        .eq('is_visible', true)
        .order('reported_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setCareUpdates(data || []);
    } catch (error) {
      console.error('Error fetching care updates:', error);
    }
  };

  const handleReportUpdate = async () => {
    if (!updateText.trim() || !petId) return;
    
    setIsSubmittingUpdate(true);
    try {
      const { error } = await supabase
        .from('care_updates')
        .insert({
          pet_id: petId,
          update_text: updateText.trim().slice(0, 200),
          is_visible: true
        });
      
      if (error) throw error;
      
      // Send notification email to owner (fire and forget)
      supabase.functions.invoke('notify-care-update', {
        body: {
          petId,
          updateText: updateText.trim().slice(0, 200),
          reportedAt: new Date().toISOString()
        }
      }).catch(err => console.error('Failed to send care update notification:', err));
      
      setUpdateText('');
      toast.success('Care update posted!');
    } catch (error) {
      console.error('Error posting care update:', error);
      toast.error('Failed to post update');
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

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

        // Fetch pet photo
        const { data: photoData } = await supabase
          .from('pet_photos')
          .select('photo_url')
          .eq('pet_id', petId)
          .single();

        setPet({
          ...petDetails,
          photoUrl: photoData?.photo_url
        });

        // Fetch care instructions
        const careInstructions = await fetchCareInstructions(petId);
        setCareData(careInstructions);

        // Fetch medical data
        const { data: medical } = await supabase
          .from('medical')
          .select('medical_conditions, medical_alert, last_vaccination, medical_emergency_document')
          .eq('pet_id', petId)
          .single();
        
        console.log('[PublicCareInstructions] Fetched medical data:', medical);
        
        if (medical) {
          setMedicalData(medical);
        }

        // Fetch care updates
        fetchCareUpdates(petId);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load care instructions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [petId]);

  // Realtime updates for care instructions and care updates
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

    const careUpdatesChannel = supabase
      .channel('care-updates-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'care_updates',
        filter: `pet_id=eq.${petId}`,
      }, (payload) => {
        const newUpdate = payload.new as CareUpdate;
        if (newUpdate.is_visible) {
          setCareUpdates(prev => [newUpdate, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(careUpdatesChannel);
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


  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
      <MetaTags 
        title={`${pet.name}'s Care Instructions | PetPort`}
        description={`Live care plan for ${pet.name}: feeding, routines, and important notes.`}
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/carehandling-og.png"
        url={`${window.location.origin}/care/${pet.id}`}
      />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          {pet.photoUrl && (
            <div className="mb-6">
              <img 
                src={pet.photoUrl} 
                alt={pet.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-sage-200"
              />
            </div>
          )}
          <h1 className="text-3xl font-sans font-bold text-navy-900 mb-2">
            {pet.name}'s Care Instructions
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 text-navy-600 mb-2">
            {pet.breed && <Badge variant="secondary">{pet.breed}</Badge>}
            {pet.species && <Badge variant="secondary">{pet.species}</Badge>}
            {pet.age && <Badge variant="secondary">Age: {pet.age}</Badge>}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-navy-600 mb-4">
            {pet.sex && <Badge variant="secondary">Sex: {pet.sex}</Badge>}
            {pet.weight && <Badge variant="secondary">Weight: {pet.weight}</Badge>}
            {pet.height && <Badge variant="secondary">Height: {pet.height}</Badge>}
            {pet.registrationNumber && <Badge variant="secondary">Registration: {pet.registrationNumber}</Badge>}
            {pet.microchipId && <Badge variant="secondary">Microchip: {pet.microchipId}</Badge>}
          </div>
          {(pet.state || pet.county) && (
            <div className="flex items-center justify-center gap-1 text-sm text-navy-500">
              <MapPin className="w-4 h-4" />
              <span>{[pet.county, pet.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Contact Owner Button */}
        <Card className="mb-6 bg-sage-50/50 border-sage-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-navy-600 mb-3">
              Questions about {pet.name}'s care? Send a message to the owner.
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

        {/* Medical Alert Banner - At top of page */}
        {medicalData?.medical_alert && (
          <Alert className="mb-6 border-red-600 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="ml-2 text-sm">
              <strong className="text-red-900">MEDICAL ALERT:</strong>{' '}
              <span className="text-red-800">{medicalData.medical_conditions || 'This pet has active medical alerts requiring immediate attention.'}</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">

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

          {/* Health Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                 <Heart className="w-5 h-5 text-primary" />
                 Health Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* General Health Monitoring Guidelines */}
              <div>
                <h4 className="font-medium text-navy-800 mb-3">Daily Monitoring Guidelines</h4>
                <ul className="space-y-2 text-navy-600">
                  <li className="flex items-start gap-2">
                    <span className="text-sage-600 mt-1">•</span>
                    Monitor appetite and water intake daily
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-600 mt-1">•</span>
                    Watch for any behavioral changes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-600 mt-1">•</span>
                    Check for signs of distress or discomfort
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-600 mt-1">•</span>
                    Contact vet immediately if concerns arise
                  </li>
                </ul>
              </div>

              {/* Medical Information */}
              {(medicalData?.medical_conditions || medicalData?.medical_alert || medicalData?.last_vaccination || medicalData?.medical_emergency_document || careData?.allergies) && (
                <div className="space-y-4 pt-4 border-t border-sage-200">

                  {medicalData.medical_conditions && (
                    <div>
                      <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Medical Conditions
                      </h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                          {medicalData.medical_conditions}
                        </p>
                      </div>
                    </div>
                  )}

                  {medicalData.last_vaccination && (
                    <div>
                      <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Last Vaccination
                      </h4>
                      <p className="text-navy-600 bg-sage-50 border border-sage-200 rounded-lg p-3">
                        {medicalData.last_vaccination}
                      </p>
                    </div>
                  )}

                  {medicalData.medical_emergency_document && (
                    <div>
                      <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Emergency Medical Document
                      </h4>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-amber-800 leading-relaxed whitespace-pre-wrap">
                          {medicalData.medical_emergency_document}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medications & Health */}
          <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <Pill className="w-5 h-5 text-red-600" />
                Medication & Supplements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pet.medications && pet.medications.length > 0 ? (
                pet.medications.map((med, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Pill className="w-4 h-4 text-red-600" />
                      <Badge variant="destructive" className="text-center text-xs sm:text-sm">
                        <span className="hidden sm:inline">MEDICATION & SUPPLEMENTS</span>
                        <span className="sm:hidden">MED & SUPPLEMENTS</span>
                      </Badge>
                    </div>
                    <p className="font-medium text-red-900">{med}</p>
                    <p className="text-sm text-red-700 mt-1">
                      Administer as prescribed. Contact vet if missed doses or reactions occur.
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Pill className="w-4 h-4 text-red-600" />
                    <Badge variant="destructive" className="text-center text-xs sm:text-sm">
                      <span className="hidden sm:inline">MEDICATION & SUPPLEMENTS</span>
                      <span className="sm:hidden">MED & SUPPLEMENTS</span>
                    </Badge>
                  </div>
                  <p className="font-medium text-red-900">No current medications</p>
                  <p className="text-sm text-red-700 mt-1">
                    Administer as prescribed. Contact vet if missed doses or reactions occur.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Notes */}
          {(careData?.allergies || careData?.behavioral_notes || careData?.favorite_activities || careData?.caretaker_notes) && (
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

                {careData.caretaker_notes && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2">Notes for Sitter</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                        {careData.caretaker_notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Care Update Board */}
          <Card className="border-sage-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <MessageCircle className="h-5 w-5 text-[#5691af]" />
                Care Update Board
              </CardTitle>
               <p className="text-sm text-navy-600 mt-2">
                 Pet sitters & caretakers: Share quick updates about {pet.name}'s care! No PetPort account needed - just use this link.
               </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Post Update Form */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="font-medium text-navy-800 mb-2">Post a Care Update</h4>
                <Textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value.slice(0, 200))}
                  placeholder={`e.g., "Fed breakfast at 8am - ate everything!" or "Walked at noon - all good!"`}
                  className="mb-2 resize-none bg-white border-slate-200"
                  rows={3}
                  maxLength={200}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-navy-600">
                    {updateText.length}/200 characters
                  </span>
                  <Button 
                    onClick={handleReportUpdate} 
                    disabled={!updateText.trim() || isSubmittingUpdate}
                    className="bg-[#5691af] hover:bg-[#4a7d99] text-white"
                    size="sm"
                  >
                    {isSubmittingUpdate ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Post Update
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Share feeding, medication, walks, or wellness updates
                </p>
              </div>

              {/* Recent Updates List */}
              <div>
                <h4 className="font-medium text-navy-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sage-600" />
                  Recent Updates ({careUpdates.length})
                </h4>
                {careUpdates.length === 0 ? (
                  <div className="bg-slate-50/50 p-6 rounded-lg border border-slate-200 text-center">
                    <MessageCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-navy-600 text-sm font-medium">
                      No updates yet
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Be the first to post a care update!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {careUpdates.map((update) => (
                      <div 
                        key={update.id} 
                        className="bg-white p-3 rounded-lg border border-slate-200 hover:border-[#5691af] transition-colors shadow-sm"
                      >
                        <p className="text-sm text-navy-800 leading-relaxed">
                          {update.update_text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(update.reported_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts */}
        <div className="mt-6">
          <ContactsDisplay 
            petId={petId || ''} 
            hideHeader={false} 
            fallbackPetData={pet}
            pageContext="care"
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Separator className="mb-6" />
          <p className="text-sm text-navy-500">
            This care information is provided by {pet.name}'s owner.
          </p>
          <p className="text-sm text-navy-500 mt-2">
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

      <ContactOwnerModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        petId={pet.id}
        petName={pet.name}
        pageType="care"
      />
    </div>
  );
};

export default PublicCareInstructions;