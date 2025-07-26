
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { QrCode, Download, Share, Phone, Pill, Shield, Heart, Award, AlertTriangle, MapPin, Clock, DollarSign, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SocialShareButtons } from "@/components/SocialShareButtons";

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
}

export const QuickIDSection = ({ petData }: QuickIDSectionProps) => {
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
      {/* Emergency Priority Contacts */}
      <Card className="bg-red-600 shadow-lg border-2 border-red-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-white font-bold">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            <span className="text-sm sm:text-base md:text-lg">EMERGENCY PRIORITY CONTACTS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {petData.emergencyContact && (
              <div className="p-4 bg-red-700/50 rounded-lg border-2 border-red-500">
                <p className="text-red-100 text-xs font-bold tracking-wide mb-2">🚨 PRIORITY 1</p>
                <p className="text-white text-sm font-semibold mb-1">PRIMARY EMERGENCY</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(petData.emergencyContact);
                  return phoneNumber ? (
                    <a 
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="text-white font-bold text-lg flex items-center gap-2 hover:text-red-200 transition-colors duration-200 cursor-pointer"
                    >
                      <Phone className="w-5 h-5" />
                      {petData.emergencyContact}
                    </a>
                  ) : (
                    <p className="text-white font-bold text-lg">{petData.emergencyContact}</p>
                  );
                })()}
              </div>
            )}
            
            {petData.secondEmergencyContact && (
              <div className="p-4 bg-red-700/50 rounded-lg border-2 border-red-500">
                <p className="text-red-100 text-xs font-bold tracking-wide mb-2">🚨 PRIORITY 2</p>
                <p className="text-white text-sm font-semibold mb-1">SECONDARY EMERGENCY</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(petData.secondEmergencyContact);
                  return phoneNumber ? (
                    <a 
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="text-white font-bold text-lg flex items-center gap-2 hover:text-red-200 transition-colors duration-200 cursor-pointer"
                    >
                      <Phone className="w-5 h-5" />
                      {petData.secondEmergencyContact}
                    </a>
                  ) : (
                    <p className="text-white font-bold text-lg">{petData.secondEmergencyContact}</p>
                  );
                })()}
              </div>
            )}
            
            {petData.vetContact && (
              <div className="p-4 bg-blue-700/50 rounded-lg border-2 border-blue-500">
                <p className="text-blue-100 text-xs font-bold tracking-wide mb-2">🏥 MEDICAL</p>
                <p className="text-white text-sm font-semibold mb-1">VETERINARIAN</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(petData.vetContact);
                  return phoneNumber ? (
                    <a 
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="text-white font-bold text-lg flex items-center gap-2 hover:text-blue-200 transition-colors duration-200 cursor-pointer"
                    >
                      <Phone className="w-5 h-5" />
                      {petData.vetContact}
                    </a>
                  ) : (
                    <p className="text-white font-bold text-lg">{petData.vetContact}</p>
                  );
                })()}
              </div>
            )}
            
            {petData.petCaretaker && (
              <div className="p-4 bg-green-700/50 rounded-lg border-2 border-green-500">
                <p className="text-green-100 text-xs font-bold tracking-wide mb-2">👤 CAREGIVER</p>
                <p className="text-white text-sm font-semibold mb-1">PET CARETAKER</p>
                {(() => {
                  const phoneNumber = extractPhoneNumber(petData.petCaretaker);
                  return phoneNumber ? (
                    <a 
                      href={`tel:${formatPhoneForTel(phoneNumber)}`}
                      className="text-white font-bold text-lg flex items-center gap-2 hover:text-green-200 transition-colors duration-200 cursor-pointer"
                    >
                      <Phone className="w-5 h-5" />
                      {petData.petCaretaker}
                    </a>
                  ) : (
                    <p className="text-white font-bold text-lg">{petData.petCaretaker}</p>
                  );
                })()}
              </div>
            )}
          </div>
          <div className="mt-4 p-2 bg-red-800/30 rounded-lg border border-red-500/50">
            <p className="text-red-100 text-xs text-center">
              📞 Tap any number to call immediately • Keep this ID accessible at all times
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick ID Preview with passport styling */}
      <Card className="bg-[#f8f8f8] shadow-lg border-2 border-gold-500/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-navy-900 border-b-2 border-gold-500 pb-2 font-bold">
            <div className="w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center">
              <QrCode className="w-5 h-5 text-gold-600" />
            </div>
            <span>EMERGENCY IDENTIFICATION CARD</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-xl text-white mb-6 relative overflow-hidden">
            {/* Passport-style decorative elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
            
            {/* PetPort Logo and branding */}
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <img 
                src="/lovable-uploads/fda1bf45-8aa7-4652-90b2-3814829f4c95.png" 
                alt="PetPort Logo"
                className="w-6 h-6 object-contain opacity-80"
              />
              <span className="text-xs font-bold opacity-80 tracking-wide">PETPORT</span>
            </div>

            {/* PetPort ID in top right with stamp design */}
            <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30">
              <span className="text-xs font-mono font-bold">{petData.petPassId}</span>
            </div>
            
            {/* Medical Alert Banner */}
            {petData.medicalAlert && (
              <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg mb-4 border-2 border-white/50 mt-10">
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span className="font-bold text-sm tracking-wide text-center">
                    MEDICAL ALERT: {petData.medicalConditions}
                  </span>
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
              </div>
            )}
            
            {/* Support Animal Status Banner */}
            {petData.supportAnimalStatus && (
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mb-4 border-2 border-white/30 mt-2">
                <div className="flex items-center justify-center space-x-2">
                  {(() => {
                    const IconComponent = getSupportAnimalIcon(petData.supportAnimalStatus);
                    return <IconComponent className="w-5 h-5" />;
                  })()}
                  <span className="font-bold text-sm tracking-wide text-center">
                    {petData.supportAnimalStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Main pet information with passport layout */}
            <div className="flex items-center space-x-6 relative z-10">
              <div className="w-20 h-20 rounded-lg overflow-hidden border-4 border-white/30 flex-shrink-0 shadow-lg">
                <img 
                  src={petData.photoUrl} 
                  alt={petData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-1">{petData.name}</h3>
                <p className="text-red-100 mb-3 text-sm sm:text-base">{petData.breed} • {petData.age}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="bg-red-600/30 p-3 rounded-lg">
                    <div className="grid grid-cols-1 gap-2">
                      {petData.emergencyContact && (() => {
                        const phoneNumber = petData.emergencyContact.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0]?.replace(/[^\d]/g, '');
                        return (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            {phoneNumber ? (
                              <a 
                                href={`tel:+1${phoneNumber}`}
                                className="font-medium hover:text-red-200 transition-colors duration-200 cursor-pointer"
                              >
                                Primary: {petData.emergencyContact}
                              </a>
                            ) : (
                              <span className="font-medium">Primary: {petData.emergencyContact}</span>
                            )}
                          </div>
                        );
                      })()}
                      {petData.secondEmergencyContact && (() => {
                        const phoneNumber = petData.secondEmergencyContact.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0]?.replace(/[^\d]/g, '');
                        return (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            {phoneNumber ? (
                              <a 
                                href={`tel:+1${phoneNumber}`}
                                className="font-medium hover:text-red-200 transition-colors duration-200 cursor-pointer"
                              >
                                Secondary: {petData.secondEmergencyContact}
                              </a>
                            ) : (
                              <span className="font-medium">Secondary: {petData.secondEmergencyContact}</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {petData.medications.length > 0 && (
                    <div className="bg-red-600/30 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Pill className="w-4 h-4" />
                        <span className="font-medium text-sm">MEDICATIONS:</span>
                      </div>
                      {petData.medications.map((med, index) => (
                        <p key={index} className="text-xs ml-6">• {med}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-red-400/30">
              <p className="text-sm text-red-100">
                <span className="font-bold">Special Notes:</span> {petData.notes}
              </p>
            </div>

            {/* Official stamp design */}
            <div className="absolute bottom-3 right-3 w-16 h-16 border-2 border-white/50 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-xs font-bold">OFFICIAL</div>
                <div className="text-xs">2025</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <Button className="bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700 border border-gold-500/30 px-2 sm:px-4 py-2 text-xs sm:text-sm">
              <QrCode className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Generate QR Code</span>
              <span className="sm:hidden">QR Code</span>
            </Button>
            <Button variant="outline" className="border-navy-900 text-navy-900 hover:bg-navy-50 px-2 sm:px-4 py-2 text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button variant="outline" className="border-navy-900 text-navy-900 hover:bg-navy-50 px-2 sm:px-4 py-2 text-xs sm:text-sm">
              <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Share Link</span>
              <span className="sm:hidden">Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing for Emergency/Missing Pet */}
      <SocialShareButtons 
        petName={petData.name}
        petId={petData.id || ""}
        isMissingPet={true}
      />

      {/* QR Code Display with passport styling */}
      <Card className="bg-[#f8f8f8] shadow-lg border-2 border-gold-500/30">
        <CardHeader>
          <CardTitle className="text-navy-900 border-b-2 border-gold-500 pb-2 font-bold">
            📱 QR CODE FOR QUICK ACCESS
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center mb-4 border-4 border-gold-500/30 shadow-lg">
            <div className="text-center text-navy-500">
              <QrCode className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">QR Code will appear here</p>
            </div>
          </div>
          <p className="text-sm text-navy-600 mb-4">
            Scan this QR code to instantly access {petData.name}'s emergency information
          </p>
          <div className="bg-gold-500/20 p-2 rounded-lg border border-gold-500/50">
            <Badge variant="outline" className="border-gold-600 text-gold-700">
              Updates automatically when profile changes
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sharing Options with passport stamps */}
      <Card className="bg-[#f8f8f8] shadow-lg border-2 border-gold-500/30">
        <CardHeader>
          <CardTitle className="text-navy-900 border-b-2 border-gold-500 pb-2 font-bold">
            📤 SHARE EMERGENCY ID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm text-center">
              <div className="w-12 h-12 bg-gold-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Share className="w-6 h-6 text-gold-600" />
              </div>
              <Button variant="outline" className="w-full border-navy-800 text-navy-800 hover:bg-navy-50 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Social Media</span>
                <span className="sm:hidden">Social</span>
              </Button>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm text-center">
              <div className="w-12 h-12 bg-gold-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Phone className="w-6 h-6 text-gold-600" />
              </div>
              <Button variant="outline" className="w-full border-navy-800 text-navy-800 hover:bg-navy-50 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Text Message</span>
                <span className="sm:hidden">Text</span>
              </Button>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm text-center">
              <div className="w-12 h-12 bg-gold-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-gold-600" />
              </div>
              <Button variant="outline" className="w-full border-navy-800 text-navy-800 hover:bg-navy-50 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">
                <span className="hidden sm:inline">Print QR Code</span>
                <span className="sm:hidden">Print</span>
              </Button>
            </div>
          </div>
          <p className="text-xs text-navy-500 mt-4 text-center">
            Perfect for dog tags, collars, or posting in your neighborhood
          </p>
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
      <Card className="bg-white shadow-xl border-2 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardTitle className="text-xl flex items-center space-x-3">
            <img 
              src={petData.photoUrl || "/placeholder.svg"} 
              alt={petData.name}
              className="w-16 h-16 rounded-full border-4 border-white object-cover"
            />
            <div>
              <h3 className="text-2xl font-bold">{petData.name}</h3>
              <p className="text-orange-100">{petData.breed} • {petData.age}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pet Details */}
            <div className="space-y-4">
              <h4 className="font-bold text-lg text-gray-800">Pet Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Breed:</strong> {petData.breed}</div>
                <div><strong>Age:</strong> {petData.age}</div>
                <div><strong>Weight:</strong> {petData.weight}</div>
                <div><strong>Color:</strong> {petData.species}</div>
              </div>
              {petData.microchip_id && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <strong>Microchip ID:</strong> {petData.microchip_id}
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
                  <p className="ml-6">{petData.emergencyContact || 'Not set'}</p>
                </div>
                {petData.secondEmergencyContact && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-orange-600" />
                      <strong>Secondary:</strong>
                    </div>
                    <p className="ml-6">{petData.secondEmergencyContact}</p>
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
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
              <Button
                onClick={toggleMissingStatus}
                className={`px-4 py-2 font-bold ${
                  lostPetData.is_missing 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {lostPetData.is_missing ? '✓ FOUND!' : '⚠️ REPORT MISSING'}
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
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <strong>Last Seen Location:</strong>
                      </div>
                      <p className="ml-7">{lostPetData.last_seen_location}</p>
                    </div>
                  )}

                  {(lostPetData.last_seen_date || lostPetData.last_seen_time) && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <strong>Last Seen:</strong>
                      </div>
                      <p className="ml-7">
                        {lostPetData.last_seen_date && format(lostPetData.last_seen_date, 'MMM dd, yyyy')}
                        {lostPetData.last_seen_time && ` at ${lostPetData.last_seen_time}`}
                      </p>
                    </div>
                  )}

                  {lostPetData.reward_amount && (
                    <div className="bg-green-50 p-4 rounded-lg">
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
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <strong>Distinctive Features:</strong>
                      <p className="mt-2">{lostPetData.distinctive_features}</p>
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

      {/* Recent Photos */}
      {petData.gallery_photos && petData.gallery_photos.length > 0 && (
        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Recent Photos</CardTitle>
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
    </div>
  );
};
