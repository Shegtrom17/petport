
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, FileText, Calendar, Pill, Image, Stethoscope, Clipboard } from "lucide-react";

interface PetData {
  name: string;
  breed: string;
  age: string;
  weight: string;
  microchipId: string;
  photoUrl: string;
  fullBodyPhotoUrl: string;
  vetContact: string;
  emergencyContact: string;
  lastVaccination: string;
  badges: string[];
  medications: string[];
  notes: string;
  species?: string;
}

interface PetProfileCardProps {
  petData: PetData;
}

export const PetProfileCard = ({ petData }: PetProfileCardProps) => {
  return (
    <div className="space-y-6">
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
              ID: {petData.microchipId}
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
          </div>
        </CardContent>
      </Card>

      {/* Passport Photos Section */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white relative">
        <div className="absolute top-4 right-4 w-16 h-8 bg-yellow-500/20 rounded transform rotate-12 flex items-center justify-center">
          <span className="text-xs font-bold text-yellow-400">OFFICIAL</span>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-400">
            <Image className="w-5 h-5" />
            <span className="tracking-wide">OFFICIAL PHOTOGRAPHS</span>
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

      {/* Emergency Contact */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span>Emergency Contact</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-red-600">{petData.emergencyContact}</p>
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

      {/* Passport-style Badges */}
      <Card className="border-2 border-yellow-600 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-yellow-400 tracking-wide">CERTIFIED ACHIEVEMENTS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {petData.badges.slice(0, 4).map((badge, index) => (
              <div key={index} className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center transform rotate-3 shadow-lg">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="text-xs text-yellow-400 font-bold text-center leading-tight">
                      {badge.split(' ').map(word => word.slice(0, 3)).join('\n')}
                    </span>
                  </div>
                </div>
                <p className="text-center text-xs mt-2 text-slate-300">{badge}</p>
              </div>
            ))}
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
