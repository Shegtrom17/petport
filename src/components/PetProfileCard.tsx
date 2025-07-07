
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, FileText, Calendar, Pill, Image } from "lucide-react";

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
}

interface PetProfileCardProps {
  petData: PetData;
}

export const PetProfileCard = ({ petData }: PetProfileCardProps) => {
  return (
    <div className="space-y-6">
      {/* Photos Section */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Image className="w-5 h-5 text-blue-600" />
            <span>Photos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Profile Photo</p>
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img 
                  src={petData.photoUrl} 
                  alt={`${petData.name} profile`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">Full Body Photo</p>
              <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-gray-200">
                <img 
                  src={petData.fullBodyPhotoUrl} 
                  alt={`${petData.name} full body`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Microchip ID</p>
              <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded border">
                {petData.microchipId}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Weight</p>
              <p className="text-lg">{petData.weight}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Notes</p>
            <p className="text-gray-800 bg-blue-50 p-3 rounded-lg">{petData.notes}</p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Veterinarian</p>
            <p className="text-lg">{petData.vetContact}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Emergency Contact</p>
            <p className="text-lg">{petData.emergencyContact}</p>
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
        </CardContent>
      </Card>

      {/* Current Badges Preview */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Current Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {petData.badges.slice(0, 4).map((badge, index) => (
              <Badge key={index} variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                {badge}
              </Badge>
            ))}
            {petData.badges.length > 4 && (
              <Badge variant="outline">+{petData.badges.length - 4} more</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
