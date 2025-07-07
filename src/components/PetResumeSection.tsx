
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, QrCode, Star, Shield, Heart, Phone, Mail } from "lucide-react";

interface PetResumeSectionProps {
  petData: {
    name: string;
    breed: string;
    species: string;
    age: string;
    weight: string;
    microchipId: string;
    photoUrl: string;
    fullBodyPhotoUrl: string;
    vetContact: string;
    emergencyContact: string;
    badges: string[];
    bio?: string;
    reviews?: Array<{
      reviewerName: string;
      reviewerContact?: string;
      rating: number;
      text: string;
      date: string;
      location: string;
    }>;
  };
}

export const PetResumeSection = ({ petData }: PetResumeSectionProps) => {
  const averageRating = petData.reviews?.length 
    ? petData.reviews.reduce((sum, review) => sum + review.rating, 0) / petData.reviews.length 
    : 0;

  const handleDownloadPDF = () => {
    console.log("Downloading Pet Resume as PDF...");
    // PDF generation would be implemented here
  };

  const handleShare = () => {
    console.log("Sharing Pet Resume...");
    // Share functionality would be implemented here
  };

  const handleQRCode = () => {
    console.log("Generating QR Code...");
    // QR code generation would be implemented here
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold">Pet Resume</h2>
                <p className="text-blue-100">Professional pet credentials & references</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleDownloadPDF} variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handleShare} variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleQRCode} variant="secondary" size="sm">
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pet Information */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Photos */}
            <div className="flex flex-col space-y-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-yellow-400 shadow-lg">
                <img 
                  src={petData.photoUrl} 
                  alt={`${petData.name} headshot`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-32 h-24 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                <img 
                  src={petData.fullBodyPhotoUrl} 
                  alt={`${petData.name} full body`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Pet Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-3xl font-bold text-navy-900 mb-2">{petData.name}</h3>
                <p className="text-lg text-gray-600 mb-4">{petData.breed} • {petData.age} • {petData.weight}</p>
              </div>

              {/* Critical Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Veterinarian</p>
                    <p className="text-sm text-blue-700">{petData.vetContact}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Emergency Contact</p>
                    <p className="text-sm text-blue-700">{petData.emergencyContact}</p>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Microchip ID</p>
                    <p className="text-sm text-blue-700 font-mono">{petData.microchipId}</p>
                  </div>
                </div>
              </div>

              {/* Rating Summary */}
              {petData.reviews && petData.reviews.length > 0 && (
                <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= averageRating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-yellow-700">
                    {averageRating.toFixed(1)}/5.0
                  </span>
                  <span className="text-sm text-yellow-600">
                    ({petData.reviews.length} review{petData.reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pet Bio */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>About {petData.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">
            {petData.bio || `${petData.name} is a wonderful ${petData.breed.toLowerCase()} with a gentle temperament and friendly disposition. Known for being well-behaved and great with people of all ages. An ideal companion for any setting.`}
          </p>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Certified Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {petData.badges.map((badge, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 transform hover:scale-105 transition-transform"
                style={{
                  backgroundImage: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
                }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold border-2 border-yellow-400"
                >
                  {badge}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
