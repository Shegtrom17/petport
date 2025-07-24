
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Share, Phone, Pill, Shield, Heart, Award, AlertTriangle } from "lucide-react";
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
    </div>
  );
};
