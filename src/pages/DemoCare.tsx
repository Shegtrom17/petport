import React, { useEffect, useState } from "react";
import { MetaTags } from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { Sparkles, Clock, Pill, Heart, AlertTriangle, MessageCircle, Send, Loader2, MapPin, Mail, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AzureButton } from "@/components/ui/azure-button";
import { useNavigate } from "react-router-dom";

const FINNEGAN_ID = "297d1397-c876-4075-bf24-41ee1862853a";

interface CareUpdate {
  id: string;
  pet_id: string;
  update_text: string;
  reported_at: string;
  is_visible: boolean;
}

export default function DemoCare() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [careUpdates, setCareUpdates] = useState<CareUpdate[]>([]);
  const [updateText, setUpdateText] = useState('');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

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

  const fetchCareUpdates = async () => {
    try {
      const { data: updates, error } = await supabase
        .from('care_updates')
        .select('*')
        .eq('pet_id', FINNEGAN_ID)
        .eq('is_visible', true)
        .order('reported_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setCareUpdates(updates || []);
    } catch (error) {
      console.error('Error fetching care updates:', error);
    }
  };

  const handleReportUpdate = async () => {
    if (!updateText.trim()) return;
    
    setIsSubmittingUpdate(true);
    try {
      const { error } = await supabase
        .from('care_updates')
        .insert({
          pet_id: FINNEGAN_ID,
          update_text: updateText.trim().slice(0, 200),
          is_visible: true
        });
      
      if (error) throw error;
      
      // Send notification email to owner (fire and forget)
      supabase.functions.invoke('notify-care-update', {
        body: {
          petId: FINNEGAN_ID,
          updateText: updateText.trim().slice(0, 200),
          reportedAt: new Date().toISOString()
        }
      }).catch(err => console.error('Failed to send care update notification:', err));
      
      setUpdateText('');
      toast.success('Care update posted!');
      fetchCareUpdates();
    } catch (error) {
      console.error('Error posting care update:', error);
      toast.error('Failed to post update');
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  useEffect(() => {
    const loadDemoData = async () => {
      try {
        // Fetch pet details
        const { data: pet, error: petError } = await supabase
          .from("pets")
          .select("*")
          .eq("id", FINNEGAN_ID)
          .single();

        if (petError) throw petError;

        // Fetch care instructions
        const { data: careInstructions } = await supabase
          .from("care_instructions")
          .select("*")
          .eq("pet_id", FINNEGAN_ID)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Fetch medical data
        const { data: medical } = await supabase
          .from("medical")
          .select("*")
          .eq("pet_id", FINNEGAN_ID)
          .single();

        // Fetch pet photos
        const { data: photos } = await supabase
          .from("pet_photos")
          .select("*")
          .eq("pet_id", FINNEGAN_ID)
          .single();

        // Fetch contacts
        const { data: contacts } = await supabase
          .from("pet_contacts")
          .select("*")
          .eq("pet_id", FINNEGAN_ID);

        setData({
          ...pet,
          careInstructions,
          medical,
          photos,
          contacts,
          medications: medical?.medications || []
        });

        // Fetch care updates
        await fetchCareUpdates();
      } catch (error) {
        console.error("Error loading demo data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDemoData();

    // Set up real-time subscription for care updates
    const careUpdatesChannel = supabase
      .channel('care-updates-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'care_updates',
        filter: `pet_id=eq.${FINNEGAN_ID}`,
      }, (payload) => {
        const newUpdate = payload.new as CareUpdate;
        if (newUpdate.is_visible) {
          setCareUpdates(prev => [newUpdate, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(careUpdatesChannel);
    };
  }, []);

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

  const care = data.careInstructions || {};
  const medical = data.medical || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
      <MetaTags 
        title="Pet Care Instructions LiveLink Example - Sitter Guide Demo | PetPort"
        description="Live demo of shareable pet care LiveLink for sitters, groomers & vets. Includes routines, medications, allergies & real-time update board."
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/resume-og-1mb.png"
        url="https://petport.app/demo/care"
      />

      {/* Live Demo Banner */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white py-3 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/demos')}
            className="absolute left-0 hover:bg-white/20 text-white p-2 h-auto"
            aria-label="Close demo"
          >
            <X className="h-5 w-5" />
          </Button>
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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          {data.photos?.photo_url && (
            <div className="mb-6">
              <img 
                src={data.photos.photo_url} 
                alt={data.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-sage-200"
              />
            </div>
          )}
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            {data.name}'s Care Instructions
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 text-navy-600 mb-2">
            {data.breed && <Badge variant="secondary">{data.breed}</Badge>}
            {data.species && <Badge variant="secondary">{data.species}</Badge>}
            {data.age && <Badge variant="secondary">Age: {data.age}</Badge>}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-navy-600 mb-4">
            {data.sex && <Badge variant="secondary">Sex: {data.sex}</Badge>}
            {data.weight && <Badge variant="secondary">Weight: {data.weight}</Badge>}
            {data.microchip_id && <Badge variant="secondary">Microchip: {data.microchip_id}</Badge>}
          </div>
          {(data.state || data.county) && (
            <div className="flex items-center justify-center gap-1 text-sm text-navy-500">
              <MapPin className="w-4 h-4" />
              <span>{[data.county, data.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Contact Owner Button */}
        <Card className="mb-6 bg-sage-50/50 border-sage-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-navy-600 mb-3">
              Questions about {data.name}'s care? Send a message to the owner.
            </p>
            <AzureButton className="gap-2">
              <Mail className="w-4 h-4" />
              Contact Owner
            </AzureButton>
          </CardContent>
        </Card>

        {/* Medical Alert Banner */}
        {medical.medical_alert && (
          <Alert className="mb-6 border-red-600 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="ml-2 text-sm">
              <strong className="text-red-900">MEDICAL ALERT:</strong>{' '}
              <span className="text-red-800">{medical.medical_conditions || 'This pet has active medical alerts requiring immediate attention.'}</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Daily Care Schedule */}
          {(care.morning_routine || care.feeding_schedule || care.evening_routine) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <Clock className="w-5 w-5 text-sage-600" />
                  Daily Care Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {care.morning_routine && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Morning Routine
                    </h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {care.morning_routine}
                    </p>
                  </div>
                )}
                
                {care.feeding_schedule && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Feeding Schedule
                    </h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {care.feeding_schedule}
                    </p>
                  </div>
                )}

                {care.evening_routine && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Evening Routine
                    </h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {care.evening_routine}
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
              {(medical.medical_conditions || medical.last_vaccination) && (
                <div className="space-y-4 pt-4 border-t border-sage-200">
                  {medical.medical_conditions && (
                    <div>
                      <h4 className="font-medium text-navy-800 mb-2">Medical Conditions</h4>
                      <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                        {medical.medical_conditions}
                      </p>
                    </div>
                  )}

                  {medical.last_vaccination && (
                    <div>
                      <h4 className="font-medium text-navy-800 mb-2">Last Vaccination</h4>
                      <p className="text-navy-600">
                        {medical.last_vaccination}
                      </p>
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
              {data.medications && data.medications.length > 0 ? (
                data.medications.map((med: any, idx: number) => (
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
          {(care.allergies || care.behavioral_notes || care.favorite_activities || care.caretaker_notes) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-navy-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {care.allergies && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2">Allergies & Sensitivities</h4>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-amber-800 leading-relaxed whitespace-pre-wrap">
                        {care.allergies}
                      </p>
                    </div>
                  </div>
                )}

                {care.behavioral_notes && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2">Behavioral Notes</h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {care.behavioral_notes}
                    </p>
                  </div>
                )}

                {care.favorite_activities && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2">Favorite Activities</h4>
                    <p className="text-navy-600 leading-relaxed whitespace-pre-wrap">
                      {care.favorite_activities}
                    </p>
                  </div>
                )}

                {care.caretaker_notes && (
                  <div>
                    <h4 className="font-medium text-navy-800 mb-2">Notes for Sitter</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                        {care.caretaker_notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Care Update Board - THE INTERACTIVE FEATURE */}
          <Card className="border-sage-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <MessageCircle className="h-5 w-5 text-[#5691af]" />
                Care Update Board
              </CardTitle>
              <p className="text-sm text-navy-600 mt-2">
                Pet sitters & caretakers: Share quick updates about {data.name}'s care!
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
            petId={FINNEGAN_ID} 
            hideHeader={false} 
            fallbackPetData={data}
            pageContext="care"
          />
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg p-8 text-center text-white mt-8 mb-6">
          <h2 className="text-2xl font-bold mb-3">Ready to Create Care Instructions for Your Pet?</h2>
          <p className="mb-4 text-white/90">Join thousands of pet owners keeping caregivers informed</p>
          <a href="/#pricing">
            <Button 
              size="lg"
              className="bg-white text-brand-primary hover:bg-brand-cream"
            >
              Get Started Today
            </Button>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm pb-8">
          <div className="border-t border-sage-200 mb-6 max-w-md mx-auto" />
          <p>This is a live demo of {data.name}'s real PetPort care instructions.</p>
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
  );
}
