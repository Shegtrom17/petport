
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QrCode, Download, Share, Share2, Phone, Pill, Shield, Heart, Award, AlertTriangle, MapPin, Clock, DollarSign, CalendarIcon, Stethoscope, Users, Eye } from "lucide-react";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PrivacyHint } from "@/components/PrivacyHint";
import { GuidanceHint } from "@/components/ui/guidance-hint";
import { Link } from "react-router-dom";
import { QuickShareHub } from "@/components/QuickShareHub";
import { SightingsModerationBoard } from "@/components/SightingsModerationBoard";



interface PetData {
  name: string;
  breed: string;
  age: string;
  weight: string;
  photoUrl: string;
  emergencyContact: string;
  secondEmergencyContact: string;
  medications: string[];
  notes: string;
  supportAnimalStatus?: string | null;
  medicalAlert: boolean;
  medicalConditions?: string;
  petPassId: string;
  id?: string;
  vetContact?: string;
  petCaretaker?: string;
  gallery_photos?: Array<{ id: string; url: string; caption?: string }>;
  species?: string;
  microchip_id?: string;
  microchipId?: string;
  sex?: string;
  height?: string;
  color?: string;
  registration_number?: string;
  registrationNumber?: string;
}

interface LostPetData {
  is_missing: boolean;
  last_seen_location: string;
  last_seen_date: Date | null;
  last_seen_time: string;
  distinctive_features: string;
  reward_amount: string;
  finder_instructions: string;
  contact_priority: string;
  emergency_notes: string;
}

// Helper function to extract phone number and create tel link
const extractPhoneNumber = (contactString: string) => {
  if (!contactString) return null;
  
  // Extract phone number using regex - handles various formats
  const phoneMatch = contactString.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return phoneMatch ? phoneMatch[0].replace(/[^\d]/g, '') : null;
};

const formatPhoneForTel = (phone: string) => {
  return `+1${phone}`; // Assuming US numbers, adjust as needed
};

interface QuickIDSectionProps {
  petData: PetData;
  onUpdate?: () => void;
}

export const QuickIDSection = ({ petData, onUpdate }: QuickIDSectionProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [lostPetData, setLostPetData] = useState<LostPetData>({
    is_missing: false,
    last_seen_location: "",
    last_seen_date: null,
    last_seen_time: "",
    distinctive_features: "",
    reward_amount: "",
    finder_instructions: "",
    contact_priority: "",
    emergency_notes: ""
  });

  useEffect(() => {
    if (petData?.id) {
      loadLostPetData(petData.id);
    }
  }, [petData?.id]);

  const loadLostPetData = async (petId: string) => {
    try {
      const { data, error } = await supabase
        .from('lost_pet_data')
        .select('*')
        .eq('pet_id', petId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading lost pet data:', error);
        return;
      }

      if (data) {
        setLostPetData({
          is_missing: data.is_missing || false,
          last_seen_location: data.last_seen_location || "",
          last_seen_date: data.last_seen_date ? new Date(data.last_seen_date) : null,
          last_seen_time: data.last_seen_time || "",
          distinctive_features: data.distinctive_features || "",
          reward_amount: data.reward_amount || "",
          finder_instructions: data.finder_instructions || "",
          contact_priority: data.contact_priority || "",
          emergency_notes: data.emergency_notes || ""
        });
      }
    } catch (error) {
      console.error('Error loading lost pet data:', error);
    }
  };

  useEffect(() => {
    console.log("QuickIDSection: showing Missing Pet help card");
  }, []);

  // Debug: confirm SocialShareButtons rendering with correct context
  useEffect(() => {
    if (!petData?.id) return;
    console.log("QuickIDSection: share card props", { petId: petData.id, isMissing: lostPetData.is_missing });
  }, [petData?.id, lostPetData.is_missing]);

  const saveLostPetData = async () => {
    if (!petData?.id) return;

    try {
      const { error } = await supabase.rpc('handle_lost_pet_data_upsert', {
        _pet_id: petData.id,
        _is_missing: lostPetData.is_missing,
        _last_seen_location: lostPetData.last_seen_location || null,
        _last_seen_date: lostPetData.last_seen_date ? lostPetData.last_seen_date.toISOString() : null,
        _last_seen_time: lostPetData.last_seen_time || null,
        _distinctive_features: lostPetData.distinctive_features || null,
        _reward_amount: lostPetData.reward_amount || null,
        _finder_instructions: lostPetData.finder_instructions || null,
        _contact_priority: lostPetData.contact_priority || null,
        _emergency_notes: lostPetData.emergency_notes || null
      });

      if (error) throw error;

      toast({
        title: "Lost pet information updated",
        description: lostPetData.is_missing ? "Your pet is now marked as missing" : "Lost pet status updated"
      });

      // Trigger parent data refresh
      if (onUpdate) {
        onUpdate();
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving lost pet data:', error);
      toast({
        title: "Error",
        description: "Failed to save lost pet information",
        variant: "destructive"
      });
    }
  };

  const toggleMissingStatus = async () => {
    const newStatus = !lostPetData.is_missing;
    setLostPetData(prev => ({ ...prev, is_missing: newStatus }));
    
    try {
      const { error } = await supabase.rpc('handle_lost_pet_data_upsert', {
        _pet_id: petData!.id,
        _is_missing: newStatus
      });

      if (error) throw error;

      toast({
        title: newStatus ? "Pet marked as missing" : "Pet found!",
        description: newStatus ? "Lost pet alert is now active" : "Missing status has been cleared",
        variant: newStatus ? "destructive" : "default"
      });

      // Trigger parent data refresh
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating missing status:', error);
      setLostPetData(prev => ({ ...prev, is_missing: !newStatus }));
    }
  };

  const getSupportAnimalIcon = (status: string) => {
    switch (status) {
      case "Emotional Support Animal":
        return Heart;
      case "Certified Therapy Dog":
        return Award;
      default:
        return Shield;
    }
  };

  return (
    <div className="space-y-6">

      {/* Help: Missing Pet directions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900">Missing Pet quick directions</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Tap “Report Missing” and fill last seen details and notes.</li>
              <li>Go to Photo Gallery, add photos with unique markings and full-body shots, then move the best 3 photos to the top positions for lost pet marketing.</li>
               <li><strong>Make profile public</strong> to enable sharing features.</li>
               <li>Use Share/QR to spread the alert and print the flyer. Shared links update in real time as you add information.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Missing Status Banner */}
      {lostPetData.is_missing && (
        <Card className="border-4 border-red-500 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4 text-red-800">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
              <div className="text-center">
                <h2 className="text-2xl font-bold">🚨 {petData.name} IS MISSING 🚨</h2>
                <p className="text-lg">
                  Last seen: {lostPetData.last_seen_location} 
                  {lostPetData.last_seen_date && ` on ${format(lostPetData.last_seen_date, 'MMM dd, yyyy')}`}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pet Basic Information */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle className="text-xl flex items-center space-x-3">
            <img 
              src={petData.photoUrl || "/placeholder.svg"} 
              alt={petData.name}
              className="w-16 h-16 rounded-full border-4 border-white object-cover"
            />
            <div>
              <h3 className="text-2xl font-bold text-brand-primary">{petData.name}</h3>
              <p className="text-muted-foreground">{petData.breed} • {petData.age}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pet Details */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-brand-primary">Pet Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {petData.species && <div><strong>Species:</strong> {petData.species}</div>}
                <div><strong>Breed:</strong> {petData.breed || 'Not specified'}</div>
                <div><strong>Age:</strong> {petData.age || 'Not specified'}</div>
                {petData.sex && <div><strong>Sex:</strong> {petData.sex}</div>}
                <div><strong>Weight:</strong> {petData.weight || 'Not specified'}</div>
                {petData.height && <div><strong>Height:</strong> {petData.height}</div>}
                <div><strong>Color:</strong> {petData.color || 'Not specified'}</div>
              </div>
              
              {/* Important ID Information - styled prominently like in PDF */}
              {(petData.microchip_id || petData.microchipId) && (
                <div className="p-3 rounded-lg border shadow-sm">
                  <strong className="text-destructive">Microchip ID:</strong> <span className="text-destructive font-semibold">{petData.microchip_id || petData.microchipId}</span>
                </div>
              )}
              
              {(petData.registration_number || petData.registrationNumber) && (
                <div className="p-3 rounded-lg border shadow-sm">
                  <strong className="text-destructive">Registration #:</strong> <span className="text-destructive font-semibold">{petData.registration_number || petData.registrationNumber}</span>
                </div>
              )}
            </div>

            {/* Contacts - Using ContactsDisplay component */}
            <div className="space-y-4">
              <ContactsDisplay petId={petData.id!} fallbackPetData={petData} />
            </div>
          </div>
          
{/* Preview Lost Pet LiveLink Button */}
<div className="mt-4">
  <Button
    onClick={() => window.open(`/missing-pet/${petData.id}?returnTo=quickid`, '_blank')}
    variant="outline"
    className="w-full bg-[#5691af] text-white hover:bg-[#4a7d99] hover:text-white border-[#5691af] focus-visible:ring-[#5691af]"
  >
    <Eye className="w-4 h-4 mr-2" />
    Preview Lost Pet LiveLink
  </Button>
</div>
        </CardContent>
      </Card>

      {/* Lost Pet Information */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-red-800 flex items-center space-x-2">
              <AlertTriangle className="w-6 h-6" />
              <span>Missing Pet Information</span>
            </CardTitle>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50 w-full sm:w-auto"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              <Button
                onClick={toggleMissingStatus}
                size="sm"
                className={`w-full sm:w-auto leading-tight ${
                  lostPetData.is_missing 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {lostPetData.is_missing ? 'Found' : 'Report Missing'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isEditing ? (
            <>
              {/* Last Seen Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Last Seen Location</Label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <Input
                    id="location"
                    value={lostPetData.last_seen_location}
                    onChange={(e) => setLostPetData(prev => ({ ...prev, last_seen_location: e.target.value }))}
                    placeholder="Enter specific address or area where pet was last seen"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Last Seen Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Last Seen Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {lostPetData.last_seen_date ? format(lostPetData.last_seen_date, "PPP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={lostPetData.last_seen_date || undefined}
                        onSelect={(date) => setLostPetData(prev => ({ ...prev, last_seen_date: date || null }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Last Seen Time</Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <Input
                      id="time"
                      type="time"
                      value={lostPetData.last_seen_time}
                      onChange={(e) => setLostPetData(prev => ({ ...prev, last_seen_time: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Distinctive Features */}
              <div className="space-y-2">
                <Label htmlFor="features">Distinctive Features</Label>
                <Textarea
                  id="features"
                  value={lostPetData.distinctive_features}
                  onChange={(e) => setLostPetData(prev => ({ ...prev, distinctive_features: e.target.value }))}
                  placeholder="Describe unique markings, scars, collar, tags, or any identifying features"
                  rows={3}
                />
              </div>

              {/* Reward Amount */}
              <div className="space-y-2">
                <Label htmlFor="reward">Reward Amount (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <Input
                    id="reward"
                    value={lostPetData.reward_amount}
                    onChange={(e) => setLostPetData(prev => ({ ...prev, reward_amount: e.target.value }))}
                    placeholder="e.g., $500 reward for safe return"
                  />
                </div>
              </div>

              {/* Finder Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions for Finder</Label>
                <Textarea
                  id="instructions"
                  value={lostPetData.finder_instructions}
                  onChange={(e) => setLostPetData(prev => ({ ...prev, finder_instructions: e.target.value }))}
                  placeholder="What should someone do if they find your pet? Include approach instructions, safety notes, etc."
                  rows={3}
                />
              </div>

              {/* Emergency Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Emergency Notes</Label>
                <Textarea
                  id="notes"
                  value={lostPetData.emergency_notes}
                  onChange={(e) => setLostPetData(prev => ({ ...prev, emergency_notes: e.target.value }))}
                  placeholder="Medical conditions, behavioral notes, fears, or other important information"
                  rows={2}
                />
              </div>

              <Button 
                onClick={saveLostPetData}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-bold"
              >
                Save Missing Pet Information
              </Button>
            </>
          ) : (
            <>
              {/* Display Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {lostPetData.last_seen_location && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <strong>Last Seen Location:</strong>
                      </div>
                      <p className="ml-7">{lostPetData.last_seen_location}</p>
                    </div>
                  )}

                  {(lostPetData.last_seen_date || lostPetData.last_seen_time) && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-brand-primary" />
                        <strong>Last Seen:</strong>
                      </div>
                      <p className="ml-7">
                        {lostPetData.last_seen_date && format(lostPetData.last_seen_date, 'MMM dd, yyyy')}
                        {lostPetData.last_seen_time && ` at ${lostPetData.last_seen_time}`}
                      </p>
                    </div>
                  )}

                  {lostPetData.reward_amount && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <strong>Reward:</strong>
                      </div>
                      <p className="ml-7">{lostPetData.reward_amount}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {lostPetData.distinctive_features && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <strong>Distinctive Features:</strong>
                      <p className="mt-2">{lostPetData.distinctive_features}</p>
                    </div>
                  )}

                  {lostPetData.finder_instructions && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <strong>If Found:</strong>
                      <p className="mt-2">{lostPetData.finder_instructions}</p>
                    </div>
                  )}

                  {lostPetData.emergency_notes && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <strong>Important Notes:</strong>
                      <p className="mt-2">{lostPetData.emergency_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sightings Moderation Board - only show when pet is missing */}
      {lostPetData.is_missing && (
        <SightingsModerationBoard petId={petData.id!} petName={petData.name} />
      )}

      {/* Photo Display Information */}
      <GuidanceHint 
        message="Photo Display Information: All photos are showcased on the public share link. PDF flyers display the first 4 photos only due to two-page format optimized for posting on bulletin boards and walls."
        variant="gentle"
        className="mb-4"
      />

      {/* Recent Photos */}
      {petData.gallery_photos && petData.gallery_photos.length > 0 && (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl text-brand-primary">Recent Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {petData.gallery_photos.map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  <img 
                    src={photo.url} 
                    alt={photo.caption || `${petData.name} photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Quick Share Hub */}
      <QuickShareHub 
        petData={petData} 
        isLost={lostPetData.is_missing}
      />
    </div>
  );
};
