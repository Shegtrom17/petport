
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
    <div className="space-y-4 sm:space-y-6">
      {/* Quick ID Preview */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-navy-900" />
            <span>Emergency Quick ID Card</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 sm:p-6 rounded-xl text-white mb-4 relative overflow-hidden">
            {/* PetPass Logo on Quick ID */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center space-x-1 sm:space-x-2">
              <img 
                src="/lovable-uploads/61126f7b-5822-4f60-bf90-f595bb83b874.png" 
                alt="PetPass Logo"
                className="w-4 h-4 sm:w-6 sm:h-6 object-contain opacity-80"
              />
              <span className="text-xs font-bold opacity-80">PETPASS</span>
            </div>

            {/* PetPass ID in top right */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-xs font-mono bg-white/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
              {petData.petPassId}
            </div>
            
            {/* Medical Alert Banner on Quick ID */}
            {petData.medicalAlert && (
              <div className="bg-black/30 backdrop-blur-sm p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 border-2 border-white/50 mt-6 sm:mt-8">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                  <span className="font-bold text-xs sm:text-sm tracking-wide text-center">
                    MEDICAL ALERT: {petData.medicalConditions}
                  </span>
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                </div>
              </div>
            )}
            
            {/* Support Animal Status Banner on Quick ID */}
            {petData.supportAnimalStatus && (
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-lg mb-3 sm:mb-4 border-2 border-white/30 mt-1 sm:mt-2">
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  {(() => {
                    const IconComponent = getSupportAnimalIcon(petData.supportAnimalStatus);
                    return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />;
                  })()}
                  <span className="font-bold text-xs sm:text-sm tracking-wide text-center">
                    {petData.supportAnimalStatus.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            
            {/* Mobile-first layout */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white/30 flex-shrink-0">
                <img 
                  src={petData.photoUrl} 
                  alt={petData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-center sm:text-left w-full">
                <h3 className="text-xl sm:text-2xl font-bold mb-1">{petData.name}</h3>
                <p className="text-red-100 mb-2 text-sm sm:text-base">{petData.breed} • {petData.age}</p>
                
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-1 sm:space-y-0 sm:space-x-2">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">Primary: {petData.emergencyContact}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-1 sm:space-y-0 sm:space-x-2">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="font-medium">Secondary: {petData.secondEmergencyContact}</span>
                    </div>
                  </div>
                  
                  {petData.medications.length > 0 && (
                    <div className="bg-red-600/30 p-2 sm:p-3 rounded-lg mt-2 sm:mt-0">
                      <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 mb-1">
                        <Pill className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="font-medium text-xs sm:text-sm">MEDICATIONS:</span>
                      </div>
                      {petData.medications.map((med, index) => (
                        <p key={index} className="text-xs text-center sm:text-left sm:ml-6">• {med}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-red-400/30">
              <p className="text-xs sm:text-sm text-red-100 text-center sm:text-left">
                <span className="font-medium">Special Notes:</span> {petData.notes}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-navy-900 to-navy-800 text-gold-500 hover:from-navy-800 hover:to-navy-700 border border-gold-500/30 text-sm py-2">
              <QrCode className="w-4 h-4" />
              <span>Generate QR Code</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2 border-navy-900 text-navy-900 hover:bg-navy-50 text-sm py-2">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center space-x-2 border-navy-900 text-navy-900 hover:bg-navy-50 text-sm py-2">
              <Share className="w-4 h-4" />
              <span>Share Link</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">QR Code for Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="text-center pt-0">
          <div className="w-40 h-40 sm:w-48 sm:h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center text-gray-500">
              <QrCode className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2" />
              <p className="text-xs sm:text-sm">QR Code will appear here</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 px-2">
            Scan this QR code to instantly access {petData.name}'s emergency information
          </p>
          <Badge variant="outline" className="text-xs">
            Updates automatically when profile changes
          </Badge>
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Share Emergency ID</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Button variant="outline" className="h-12 sm:h-16 flex flex-col items-center justify-center space-y-1 border-navy-800 text-navy-800 hover:bg-navy-50 text-xs sm:text-sm">
              <Share className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Social Media</span>
            </Button>
            <Button variant="outline" className="h-12 sm:h-16 flex flex-col items-center justify-center space-y-1 border-navy-800 text-navy-800 hover:bg-navy-50 text-xs sm:text-sm">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Text Message</span>
            </Button>
            <Button variant="outline" className="h-12 sm:h-16 flex flex-col items-center justify-center space-y-1 border-navy-800 text-navy-800 hover:bg-navy-50 text-xs sm:text-sm">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Print QR Code</span>
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-3 sm:mt-4 text-center px-2">
            Perfect for dog tags, collars, or posting in your neighborhood
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
