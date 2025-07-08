
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Share, Phone, Pill, Shield, Heart, Award, AlertTriangle } from "lucide-react";

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
}

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
      {/* Quick ID Preview */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-navy-900" />
            <span>Emergency Quick ID Card</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-xl text-white mb-4 relative overflow-hidden">
            {/* PetPass Logo on Quick ID */}
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <img 
                src="/lovable-uploads/61126f7b-5822-4f60-bf90-f595bb83b874.png" 
                alt="PetPass Logo"
                className="w-6 h-6 object-contain opacity-80"
              />
              <span className="text-xs font-bold opacity-80">PETPASS</span>
            </div>

            {/* PetPass ID in top right */}
            <div className="absolute top-3 right-3 text-xs font-mono bg-white/20 px-2 py-1 rounded">
              {petData.petPassId}
            </div>
            
            {/* Medical Alert Banner on Quick ID */}
            {petData.medicalAlert && (
              <div className="bg-black/30 backdrop-blur-sm p-3 rounded-lg mb-4 border-2 border-white/50 mt-8">
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span className="font-bold text-sm tracking-wide">
                    MEDICAL ALERT: {petData.medicalConditions}
                  </span>
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
              </div>
            )}
            
            {/* Support Animal Status Banner on Quick ID */}
            {petData.supportAnimalStatus && (
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg mb-4 border-2 border-white/30 mt-2">
                <div className="flex items-center justify-center space-x-2">
                  {(() => {
                    const IconComponent = getSupportAnimalIcon(petData.supportAnimalStatus);
                    return <IconComponent className="w-5 h-5" />;
                  })()}
                  <span className="font-bold text-sm tracking-wide">
                    {petData.supportAnimalStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 flex-shrink-0">
                <img 
                  src={petData.photoUrl} 
                  alt={petData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-1">{petData.name}</h3>
                <p className="text-red-100 mb-2">{petData.breed} • {petData.age}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Primary: {petData.emergencyContact}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Secondary: {petData.secondEmergencyContact}</span>
                  </div>
                  
                  {petData.medications.length > 0 && (
                    <div className="bg-red-600/30 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Pill className="w-4 h-4" />
                        <span className="font-medium">MEDICATIONS:</span>
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
                <span className="font-medium">Special Notes:</span> {petData.notes}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="flex items-center space-x-2 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700 border border-gold-500/30">
              <QrCode className="w-4 h-4" />
              <span>Generate QR Code</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 border-navy-900 text-navy-900 hover:bg-navy-50">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 border-navy-900 text-navy-900 hover:bg-navy-50">
              <Share className="w-4 h-4" />
              <span>Share Link</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle>QR Code for Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center text-gray-500">
              <QrCode className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">QR Code will appear here</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code to instantly access {petData.name}'s emergency information
          </p>
          <Badge variant="outline" className="text-xs">
            Updates automatically when profile changes
          </Badge>
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Share Emergency ID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 border-navy-800 text-navy-800 hover:bg-navy-50">
              <Share className="w-5 h-5" />
              <span className="text-sm">Social Media</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 border-navy-800 text-navy-800 hover:bg-navy-50">
              <Phone className="w-5 h-5" />
              <span className="text-sm">Text Message</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1 border-navy-800 text-navy-800 hover:bg-navy-50">
              <QrCode className="w-5 h-5" />
              <span className="text-sm">Print QR Code</span>
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Perfect for dog tags, collars, or posting in your neighborhood
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
