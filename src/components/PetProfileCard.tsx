
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, FileText, Calendar, Pill, Image, Stethoscope, Clipboard, AlertTriangle, Upload, User, Camera } from "lucide-react";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";

interface PetData {
  name: string;
  breed: string;
  age: string;
  weight: string;
  microchipId: string;
  petPassId: string;
  photoUrl: string;
  fullBodyPhotoUrl: string;
  vetContact: string;
  emergencyContact: string;
  secondEmergencyContact: string;
  petCaretaker: string;
  lastVaccination: string;
  badges: string[];
  medications: string[];
  notes: string;
  species?: string;
  supportAnimalStatus?: string | null;
  medicalAlert: boolean;
  medicalConditions?: string;
  medicalEmergencyDocument?: string | null;
  galleryPhotos?: Array<{ url: string; caption: string; }>;
}

interface PetProfileCardProps {
  petData: PetData;
}

export const PetProfileCard = ({ petData }: PetProfileCardProps) => {
  const handleUploadMedicalDoc = () => {
    console.log("Opening medical document upload...");
    // Document upload would be implemented here
  };

  const handleViewGallery = () => {
    console.log("Switching to gallery view...");
    // This would trigger navigation to gallery tab
  };

  return (
    <div className="space-y-6">
      {/* Support Animal Status Banner */}
      <SupportAnimalBanner status={petData.supportAnimalStatus || null} />

      {/* Medical Alert Banner */}
      {petData.medicalAlert && (
        <Card className="border-2 border-red-600 shadow-xl bg-gradient-to-r from-red-500 to-red-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
              <div className="text-center">
                <h3 className="text-xl font-bold tracking-wide">MEDICAL ALERT</h3>
                <p className="text-red-100 text-sm">{petData.medicalConditions}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passport Header - Vet & Microchip Info */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-navy-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/10 rounded-full translate-y-12 -translate-x-12"></div>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <CardTitle className="text-yellow-400 text-lg font-bold tracking-wide">VETERINARY CONTACT</CardTitle>
                <p className="text-slate-300 text-sm">Emergency Medical Information</p>
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              PetPass ID: {petData.petPassId}
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">PRIMARY VETERINARIAN</p>
              <p className="text-lg font-medium">{petData.vetContact}</p>
            </div>
            <div className="space-y-2">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">MICROCHIP NUMBER</p>
              <p className="text-lg font-mono bg-slate-700/50 px-3 py-2 rounded border border-yellow-600/30">
                {petData.microchipId}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">PET CARETAKER</p>
              <p className="text-lg font-medium">{petData.petCaretaker}</p>
            </div>
            <div className="space-y-2">
              <p className="text-yellow-400 text-sm font-semibold tracking-wide">PETPASS ID</p>
              <p className="text-lg font-mono bg-slate-700/50 px-3 py-2 rounded border border-yellow-600/30">
                {petData.petPassId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passport Photos Section */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white relative">
        <div className="absolute top-4 right-4 w-20 h-12 bg-yellow-500/20 rounded-lg transform rotate-6 flex items-center justify-center border border-yellow-400/30">
          <div className="text-center">
            <div className="w-4 h-4 bg-yellow-400 rounded-full mx-auto mb-1"></div>
            <span className="text-xs font-bold text-yellow-400 block leading-tight">VERIFIED<br/>PHOTOS</span>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-yellow-400">
            <div className="flex items-center space-x-2">
              <Image className="w-5 h-5" />
              <span className="tracking-wide">OFFICIAL PHOTOGRAPHS</span>
            </div>
            <Button 
              onClick={handleViewGallery}
              variant="outline" 
              size="sm"
              className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
            >
              <Camera className="w-4 h-4 mr-2" />
              View Gallery ({petData.galleryPhotos?.length || 0})
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-yellow-400 text-sm font-semibold tracking-wide">PORTRAIT</p>
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-900">1</span>
                </div>
              </div>
              <div className="aspect-square rounded-lg overflow-hidden border-4 border-yellow-600/50 shadow-lg">
                <img 
                  src={petData.photoUrl} 
                  alt={`${petData.name} portrait`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-yellow-400 text-sm font-semibold tracking-wide">FULL PROFILE</p>
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-900">2</span>
                </div>
              </div>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border-4 border-yellow-600/50 shadow-lg">
                <img 
                  src={petData.fullBodyPhotoUrl} 
                  alt={`${petData.name} full profile`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passport Basic Information */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-400">
            <FileText className="w-5 h-5" />
            <span className="tracking-wide">IDENTIFICATION DETAILS</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-700/30 p-4 rounded-lg border border-yellow-600/30">
            <p className="text-yellow-400 text-sm font-semibold tracking-wide mb-2">BEHAVIORAL NOTES</p>
            <p className="text-slate-200">{petData.notes}</p>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span>Emergency Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Primary Emergency Contact</p>
            <p className="text-lg font-medium text-red-600">{petData.emergencyContact}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Secondary Emergency Contact</p>
            <p className="text-lg font-medium text-red-600">{petData.secondEmergencyContact}</p>
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Health Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Last Vaccination</p>
            <p className="text-lg text-green-600 font-medium">{petData.lastVaccination}</p>
          </div>
          
          {/* Medical Alert Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Medical Alerts</p>
              {petData.medicalAlert && (
                <Badge variant="destructive" className="bg-red-600">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  ALERT
                </Badge>
              )}
            </div>
            {petData.medicalAlert ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">Medical Conditions:</p>
                <p className="text-red-700">{petData.medicalConditions}</p>
                
                <div className="mt-4 flex items-center space-x-2">
                  {petData.medicalEmergencyDocument ? (
                    <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                      <FileText className="w-4 h-4 mr-2" />
                      View Medical Document
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleUploadMedicalDoc}
                      size="sm" 
                      variant="outline" 
                      className="border-red-300 text-red-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Medical Document
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No medical alerts</p>
            )}
          </div>

          {petData.medications.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Current Medications</p>
              <div className="space-y-2">
                {petData.medications.map((medication, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-red-50 p-3 rounded-lg">
                    <Pill className="w-4 h-4 text-red-500" />
                    <span>{medication}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passport-style Badges with New Icons */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-yellow-400 tracking-wide">CERTIFIED ACHIEVEMENTS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {petData.badges.slice(0, 4).map((badge, index) => {
              // Different icons for different badge types
              const getIcon = (badgeName: string) => {
                if (badgeName.toLowerCase().includes('therapy') || badgeName.toLowerCase().includes('certified')) return '🏆';
                if (badgeName.toLowerCase().includes('kids') || badgeName.toLowerCase().includes('child')) return '🐾';
                if (badgeName.toLowerCase().includes('trained') || badgeName.toLowerCase().includes('behaved')) return '🦴';
                return '🌍';
              };

              return (
                <div key={index} className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center transform rotate-3 shadow-lg">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {getIcon(badge)}
                      </span>
                    </div>
                  </div>
                  <p className="text-center text-xs mt-2 text-slate-300">{badge}</p>
                </div>
              );
            })}
          </div>
          {petData.badges.length > 4 && (
            <div className="text-center mt-4">
              <Badge variant="outline" className="border-yellow-600 text-yellow-400">
                +{petData.badges.length - 4} more achievements
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
