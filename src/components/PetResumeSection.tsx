import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share2, QrCode, Star, Shield, Heart, Phone, Mail, Award, AlertTriangle, MapPin, GraduationCap, Trophy, Activity, Edit, Eye } from "lucide-react";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { PetResumeEditForm } from "@/components/PetResumeEditForm";
import { generatePetPDF, downloadPDFBlob, viewPDFBlob } from "@/services/pdfService";
import { toast } from "sonner";

// Helper function to extract phone number and create tel link
const extractPhoneNumber = (contactString: string) => {
  if (!contactString) return null;
  
  // Extract phone number using regex - supports various formats
  const phoneMatch = contactString.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    return phoneMatch[0].replace(/[^\d]/g, ''); // Remove non-digit characters
  }
  return null;
};

const formatPhoneForTel = (phone: string) => {
  return `+1${phone}`; // Assuming US numbers, adjust as needed
};

interface PetResumeSectionProps {
  petData: {
    id: string;
    name: string;
    breed: string;
    species: string;
    age: string;
    weight: string;
    microchipId: string;
    petPassId: string;
    photoUrl: string;
    fullBodyPhotoUrl: string;
    vetContact: string;
    emergencyContact: string;
    secondEmergencyContact: string;
    badges: string[];
    bio?: string;
    supportAnimalStatus?: string | null;
    medicalAlert: boolean;
    medicalConditions?: string;
    experiences?: Array<{
      activity: string;
      contact?: string;
      description: string;
    }>;
    achievements?: Array<{
      title: string;
      description: string;
    }>;
    training?: Array<{
      course: string;
      facility: string;
      phone: string;
      completed: string;
    }>;
    reviews?: Array<{
      reviewerName: string;
      reviewerContact?: string;
      rating: number;
      text: string;
      date: string;
      location: string;
    }>;
  };
  onUpdate?: () => void;
}

export const PetResumeSection = ({ petData, onUpdate }: PetResumeSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const averageRating = petData.reviews?.length 
    ? petData.reviews.reduce((sum, review) => sum + review.rating, 0) / petData.reviews.length 
    : 0;

  const handleDownloadPDF = async () => {
    console.log("Downloading Pet Resume as PDF...");
    setIsGeneratingPDF(true);
    toast.loading("Generating PDF...");
    
    try {
      const result = await generatePetPDF(petData.id, 'full');
      
      if (result.success && result.pdfBlob) {
        setGeneratedPdfBlob(result.pdfBlob);
        toast.success("PDF generated successfully! Choose view or download below.");
      } else {
        toast.error(result.error || "Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleViewPDF = async () => {
    if (generatedPdfBlob) {
      const filename = `${petData.name}_Resume.pdf`;
      await viewPDFBlob(generatedPdfBlob, filename);
    }
  };

  const handleDownloadGeneratedPDF = async () => {
    if (generatedPdfBlob) {
      const filename = `${petData.name}_Resume.pdf`;
      await downloadPDFBlob(generatedPdfBlob, filename);
      toast.success("PDF downloaded successfully!");
    }
  };

  const handleShare = () => {
    console.log("Sharing Pet Resume...");
    // Share functionality would be implemented here
  };

  const handleQRCode = () => {
    console.log("Generating QR Code...");
    // QR code generation would be implemented here
  };

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Documentation Note */}
      <Card className="border-0 shadow-lg bg-blue-50 border-l-4 border-blue-500">
        <CardContent className="p-4">
          <p className="text-blue-800 text-sm font-medium">
            📄 For supporting documentation, please see the Documents page.
          </p>
        </CardContent>
      </Card>

      {/* Support Animal Status Banner */}
      <SupportAnimalBanner status={petData.supportAnimalStatus || null} />

      {/* Medical Alert Banner - Only show if medicalAlert is true */}
      {petData.medicalAlert && petData.medicalConditions && (
        <Card className="border-2 border-red-600 shadow-xl bg-gradient-to-r from-red-500 to-red-600 text-white relative overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02] hover:border-red-400"
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-care'))}>
          <div className="absolute inset-0 bg-black/10"></div>
          <CardContent className="p-4 relative">
            <div className="flex items-center justify-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
              <div className="text-center">
                <h3 className="text-xl font-bold tracking-wide">MEDICAL ALERT</h3>
                <p className="text-red-100 text-sm">{petData.medicalConditions}</p>
                <div className="mt-2 pt-2 border-t border-red-400/50">
                  <p className="text-red-200 text-xs font-medium">
                    👆 Click to view full medical details
                  </p>
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Actions */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold">Pet Resume</h2>
                <p className="text-blue-100">Professional pet credentials & references</p>
                <p className="text-xs text-blue-200 mt-1">PetPort ID: {petData.petPassId}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setIsEditModalOpen(true)} 
                variant="secondary" 
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                onClick={handleDownloadPDF} 
                variant="secondary" 
                size="sm"
                disabled={isGeneratingPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? "Generating..." : "PDF"}
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

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pet Resume</DialogTitle>
          </DialogHeader>
          <PetResumeEditForm
            petData={petData}
            onSave={handleEditSave}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* PDF Options - Show after generation */}
      {generatedPdfBlob && !isGeneratingPDF && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500">
          <CardContent className="p-6">
            <div className="text-center">
              <h4 className="font-bold text-green-800 mb-3">✅ Pet Resume PDF Generated!</h4>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={handleViewPDF}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View PDF
                </Button>
                <Button
                  onClick={handleDownloadGeneratedPDF}
                  className="bg-gradient-to-r from-green-500 to-green-400 text-white hover:from-green-400 hover:to-green-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
              <p className="text-sm text-green-600 mt-3">
                Generated complete profile including resume, care instructions & contact info
              </p>
            </div>
          </CardContent>
        </Card>
      )}

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
                    {(() => {
                      const phoneNumber = extractPhoneNumber(petData.vetContact);
                      return phoneNumber ? (
                        <a 
                          href={`tel:${formatPhoneForTel(phoneNumber)}`}
                          className="text-sm text-blue-700 hover:text-blue-900 transition-colors duration-200 cursor-pointer flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {petData.vetContact}
                        </a>
                      ) : (
                        <p className="text-sm text-blue-700">{petData.vetContact}</p>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Primary Emergency</p>
                    {(() => {
                      const phoneNumber = extractPhoneNumber(petData.emergencyContact);
                      return phoneNumber ? (
                        <a 
                          href={`tel:${formatPhoneForTel(phoneNumber)}`}
                          className="text-sm text-blue-700 hover:text-blue-900 transition-colors duration-200 cursor-pointer flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {petData.emergencyContact}
                        </a>
                      ) : (
                        <p className="text-sm text-blue-700">{petData.emergencyContact}</p>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Secondary Emergency</p>
                    {(() => {
                      const phoneNumber = extractPhoneNumber(petData.secondEmergencyContact);
                      return phoneNumber ? (
                        <a 
                          href={`tel:${formatPhoneForTel(phoneNumber)}`}
                          className="text-sm text-blue-700 hover:text-blue-900 transition-colors duration-200 cursor-pointer flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {petData.secondEmergencyContact}
                        </a>
                      ) : (
                        <p className="text-sm text-blue-700">{petData.secondEmergencyContact}</p>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">PetPort ID</p>
                    <p className="text-sm text-blue-700 font-mono">{petData.petPassId}</p>
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

      {/* Experience Section */}
      {petData.experiences && petData.experiences.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>Experience & Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {petData.experiences.map((exp, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800">{exp.activity}</h4>
                  <p className="text-gray-600 text-sm mb-2">{exp.description}</p>
                  {exp.contact && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <Phone className="w-3 h-3" />
                      <span>Contact: {exp.contact}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements Section */}
      {petData.achievements && petData.achievements.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span>Notable Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {petData.achievements.map((achievement, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">{achievement.title}</h4>
                  <p className="text-yellow-700 text-sm">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training & Education Section */}
      {petData.training && petData.training.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <span>Training & Certifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {petData.training.map((course, index) => (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800">{course.course}</h4>
                  <div className="mt-2 space-y-1 text-sm text-purple-700">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3" />
                      <span>{course.facility}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3" />
                      <span>{course.phone}</span>
                    </div>
                    <p className="text-xs text-purple-600">Completed: {course.completed}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phase 2 Note for Equine Badges */}
      {petData.species.toLowerCase() === 'horse' && (
        <Card className="border-0 shadow-lg bg-amber-50 border-l-4 border-amber-500">
          <CardContent className="p-4">
            <p className="text-amber-800 text-sm font-medium">
              🐴 Note: Equine-specific badges and certifications will be available in Phase 2 to better reflect horse-related skills and achievements.
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
};
