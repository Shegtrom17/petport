import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertTriangle, Phone, Share, Download, MapPin, Clock, DollarSign, Eye, Search, Heart, Facebook, Copy, MessageCircle, Mail } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { usePetData } from "@/hooks/usePetData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { PetPDFGenerator } from "@/components/PetPDFGenerator";
import { LostPetPDFGenerator } from "@/components/LostPetPDFGenerator";

const LostPet = () => {
  const { petId } = useParams();
  const { user } = useAuth();
  const { pets, selectedPet, handleSelectPet, isLoading } = usePetData(petId);
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [lostPetData, setLostPetData] = useState({
    is_missing: false,
    last_seen_location: "",
    last_seen_date: null as Date | null,
    last_seen_time: "",
    distinctive_features: "",
    reward_amount: "",
    finder_instructions: "",
    contact_priority: "",
    emergency_notes: ""
  });

  // Wait for loading to complete and pets to be available
  const currentPet = selectedPet;
  const [petDataLoaded, setPetDataLoaded] = useState(false);

  const loadLostPetData = async (petId: string) => {
    try {
      const { data, error } = await supabase
        .from('lost_pet_data')
        .select('*')
        .eq('pet_id', petId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
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
    console.log('LostPet useEffect - petId:', petId, 'pets loaded:', pets.length > 0, 'selectedPet:', selectedPet?.id, 'isLoading:', isLoading);
    
    // Wait for pets to load and pet to be selected
    if (!isLoading && selectedPet) {
      console.log('LostPet - Pet data loaded, loading lost pet data for:', selectedPet.id);
      loadLostPetData(selectedPet.id);
      setPetDataLoaded(true);
    }
  }, [isLoading, selectedPet?.id, petId]);

  // Show loading state while data is being loaded
  if (isLoading || !petDataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-[#F5F0E0] to-yellow-50 flex items-center justify-center">
        <div className="text-lg text-red-800">Loading pet data...</div>
      </div>
    );
  }

  // Redirect if no pet found after loading
  if (!currentPet) {
    return <Navigate to="/" replace />;
  }

  const saveLostPetData = async () => {
    if (!currentPet?.id) return;

    try {
      const { error } = await supabase.rpc('handle_lost_pet_data_upsert', {
        _pet_id: currentPet.id,
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
    
    // Auto-save when toggling missing status
    try {
      const { error } = await supabase.rpc('handle_lost_pet_data_upsert', {
        _pet_id: currentPet!.id,
        _is_missing: newStatus
      });

      if (error) throw error;

      toast({
        title: newStatus ? "Pet marked as missing" : "Pet found!",
        description: newStatus ? "Lost pet alert is now active" : "Missing status has been cleared",
        variant: newStatus ? "destructive" : "default"
      });
    } catch (error) {
      console.error('Error updating missing status:', error);
      setLostPetData(prev => ({ ...prev, is_missing: !newStatus })); // Revert on error
    }
  };

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-[#F5F0E0] to-yellow-50 flex items-center justify-center">
        <div className="text-lg text-red-800">No pet selected</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-[#F5F0E0] to-yellow-50">
      {/* Emergency Header */}
      <div className={`bg-gradient-to-r ${lostPetData.is_missing ? 'from-red-600 to-red-700' : 'from-gold-500 to-gold-400'} text-white py-6 px-4 shadow-lg`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                {lostPetData.is_missing ? (
                  <Search className="w-8 h-8" />
                ) : (
                  <Heart className="w-8 h-8" />
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {lostPetData.is_missing ? 'MISSING PET ALERT' : 'Missing Pet Info'}
                </h1>
                <p className="text-red-100">
                  {lostPetData.is_missing ? 'Help bring them home safely' : 'Prepare for emergencies'}
                </p>
              </div>
            </div>
            <Button
              onClick={toggleMissingStatus}
              className={`w-full md:w-auto px-6 py-3 font-bold text-lg ${
                lostPetData.is_missing 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {lostPetData.is_missing ? '✓ FOUND!' : '⚠️ REPORT MISSING'}
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Instructions Section - Moved to top */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 rounded-full p-2 flex-shrink-0">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Create a Missing Pet Flyer</h3>
                <div className="space-y-2 text-blue-800">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Mark your pet as missing using the button above</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Click 'Missing Pet Flyer' button that appears at the top of the page</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                    <span>Generate a printable PDF with photos, contact details, and pet information</span>
                  </div>
                </div>
                <p className="text-sm text-blue-700 mt-3 font-medium">
                  The flyer includes all essential information to help bring your pet home safely.
                </p>
              </div>
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
                  <h2 className="text-2xl font-bold">🚨 {currentPet.name} IS MISSING 🚨</h2>
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

        {/* Pet Information Card */}
        <Card className="bg-white shadow-xl border-2 border-gold-500">
          <CardHeader className="bg-gradient-to-r from-gold-500 to-gold-400 text-white">
            <CardTitle className="text-xl flex items-center space-x-3">
              <img 
                src={currentPet.photoUrl || "/placeholder.svg"} 
                alt={currentPet.name}
                className="w-16 h-16 rounded-full border-4 border-white object-cover"
              />
              <div>
                <h3 className="text-2xl font-bold">{currentPet.name}</h3>
                <p className="text-[#E6D89C]">{currentPet.breed} • {currentPet.age}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pet Details */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-800">Pet Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Breed:</strong> {currentPet.breed}</div>
                  <div><strong>Age:</strong> {currentPet.age}</div>
                  <div><strong>Weight:</strong> {currentPet.weight}</div>
                  <div><strong>Color:</strong> {currentPet.species}</div>
                </div>
                {currentPet.microchip_id && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <strong>Microchip ID:</strong> {currentPet.microchip_id}
                  </div>
                )}
              </div>

              {/* Emergency Contacts */}
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-800">Emergency Contacts</h4>
                <div className="space-y-2">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-red-600" />
                      <strong>Primary:</strong>
                    </div>
                    <p className="ml-6">{currentPet.emergency_contact || 'Not set'}</p>
                  </div>
                  {currentPet.second_emergency_contact && (
                    <div className="bg-gold-300/20 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gold-500" />
                        <strong>Secondary:</strong>
                      </div>
                      <p className="ml-6">{currentPet.second_emergency_contact}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lost Pet Information */}
        <Card className="bg-white shadow-xl border-2 border-red-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-red-800 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6" />
                <span>Missing Pet Information</span>
              </CardTitle>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
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
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-5 h-5 text-red-600" />
                          <strong>Last Seen Location:</strong>
                        </div>
                        <p className="ml-7">{lostPetData.last_seen_location}</p>
                      </div>
                    )}

                    {(lostPetData.last_seen_date || lostPetData.last_seen_time) && (
                      <div className="bg-[#F5F0E0] p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="w-5 h-5 text-[#B8860B]" />
                          <strong>Last Seen:</strong>
                        </div>
                        <p className="ml-7">
                          {lostPetData.last_seen_date && format(lostPetData.last_seen_date, 'PPP')}
                          {lostPetData.last_seen_time && ` at ${lostPetData.last_seen_time}`}
                        </p>
                      </div>
                    )}

                    {lostPetData.reward_amount && (
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <strong>Reward Offered:</strong>
                        </div>
                        <p className="ml-7 text-lg font-bold text-green-700">{lostPetData.reward_amount}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {lostPetData.distinctive_features && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Eye className="w-5 h-5 text-blue-600" />
                          <strong>Distinctive Features:</strong>
                        </div>
                        <p className="ml-7">{lostPetData.distinctive_features}</p>
                      </div>
                    )}

                    {lostPetData.finder_instructions && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <strong>If Found:</strong>
                        <p className="mt-2">{lostPetData.finder_instructions}</p>
                      </div>
                    )}

                    {lostPetData.emergency_notes && (
                      <div className="bg-red-50 p-4 rounded-lg">
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

        {/* Share Missing Alert - compact, placed near main hub */}
        {lostPetData.is_missing && (
          <SocialShareButtons
            petName={currentPet.name}
            petId={currentPet.id || ""}
            isMissingPet={true}
            context="missing"
            defaultOpenOptions={false}
          />
        )}

        {/* Gallery Photos */}
        {currentPet.gallery_photos && currentPet.gallery_photos.length > 0 && (
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Recent Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentPet.gallery_photos.map((photo: any, index: number) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                    <img 
                      src={photo.url} 
                      alt={photo.caption || `${currentPet.name} photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Only the Missing Pet Flyer - stripped down version */}
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Missing Pet Flyer</CardTitle>
            <p className="text-sm text-muted-foreground">Generate flyer to help find your pet</p>
          </CardHeader>
          <CardContent>
            <LostPetPDFGenerator 
              petId={currentPet.id || ""} 
              petName={currentPet.name}
              isActive={lostPetData.is_missing}
              petData={{
                ...currentPet,
                ...lostPetData
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LostPet;