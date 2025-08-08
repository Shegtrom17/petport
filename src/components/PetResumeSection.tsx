import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Share2, QrCode, Star, Shield, Heart, Phone, Mail, Award, AlertTriangle, MapPin, GraduationCap, Trophy, Activity, Edit, Eye } from "lucide-react";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { PetResumeEditForm } from "@/components/PetResumeEditForm";
import { generatePublicProfileUrl, shareProfileOptimized, generateQRCodeUrl } from "@/services/pdfService";
import { generateClientPetPDF, downloadPDFBlob, viewPDFBlob } from "@/services/clientPdfService";
import { PrivacyHint } from "@/components/PrivacyHint";
import { toast } from "sonner";
import { SocialShareButtons } from "@/components/SocialShareButtons";

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
    is_public?: boolean;
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
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isReviewsShareDialogOpen, setIsReviewsShareDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const averageRating = petData.reviews?.length 
    ? petData.reviews.reduce((sum, review) => sum + review.rating, 0) / petData.reviews.length 
    : 0;

  const showPdfOptions = () => {
    setIsPdfDialogOpen(true);
  };

  const handlePdfAction = async (action: 'view' | 'download') => {
    setIsGeneratingPDF(true);
    
    try {
      const result = await generateClientPetPDF(petData, 'resume');
      
      if (result.success && result.pdfBlob) {
        setGeneratedPdfBlob(result.pdfBlob);
        
        if (action === 'download') {
          const filename = `${petData.name}_Resume.pdf`;
          await downloadPDFBlob(result.pdfBlob, filename);
          toast.success("PDF downloaded successfully!");
          setIsPdfDialogOpen(false);
        } else if (action === 'view') {
          const filename = `${petData.name}_Resume.pdf`;
          await viewPDFBlob(result.pdfBlob, filename);
        }
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

  const handleShare = async () => {
    if (!petData.is_public) {
      toast.error("Pet profile must be public to share. Please enable public visibility in quick actions on the profile page.");
      return;
    }

    setIsSharing(true);
    try {
      const profileUrl = generatePublicProfileUrl(petData.id);
      const result = await shareProfileOptimized(profileUrl, petData.name, 'profile');
      
      if (result.success) {
        toast.success(result.message || "Profile shared successfully!");
      } else {
        toast.error(result.message || "Failed to share profile");
      }
    } catch (error) {
      console.error("Error sharing profile:", error);
      toast.error("Failed to share profile");
    } finally {
      setIsSharing(false);
    }
  };

  const handleQRCode = () => {
    if (!petData.is_public) {
      toast.error("Pet profile must be public to generate QR code. Please enable public visibility in quick actions on the profile page.");
      return;
    }
    setIsQRDialogOpen(true);
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
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3 flex-1">
              <Shield className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold">Pet Resume</h2>
                <p className="text-blue-100">Professional pet credentials & references</p>
                <p className="text-xs text-blue-200 mt-1">PetPort ID: {petData.petPassId}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 ml-6">
              <div
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Edit pet resume"
                onKeyDown={(e) => e.key === 'Enter' && setIsEditModalOpen(true)}
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Edit</span>
              </div>
              <div
                onClick={showPdfOptions}
                className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Generate PDF"
                onKeyDown={(e) => e.key === 'Enter' && showPdfOptions()}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">PDF</span>
              </div>
              <div className="flex flex-col gap-1">
                <div
                  onClick={() => setIsShareDialogOpen(true)}
                  className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Share credentials"
                  onKeyDown={(e) => e.key === 'Enter' && setIsShareDialogOpen(true)}
                >
                  <Share2 className="w-4 h-4" />
                </div>
                <div
                  onClick={() => setIsReviewsShareDialogOpen(true)}
                  className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Share reviews"
                  onKeyDown={(e) => e.key === 'Enter' && setIsReviewsShareDialogOpen(true)}
                >
                  <Star className="w-4 h-4" />
                </div>
                <div
                  onClick={handleQRCode}
                  className="flex items-center space-x-2 p-2 text-white hover:text-blue-200 hover:scale-110 transition-all cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label="Generate QR code"
                  onKeyDown={(e) => e.key === 'Enter' && handleQRCode()}
                >
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          {!petData.is_public && (
            <div className="mt-4 pt-4 border-t border-blue-400/30">
              <p className="text-sm text-blue-200 text-center">
                📝 Make your profile public in the privacy settings above to enable sharing & QR codes
              </p>
            </div>
          )}
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

      {/* PDF Options Dialog */}
      <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
              📋 Pet Resume PDF Options
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* PDF Actions */}
            {!generatedPdfBlob && !isGeneratingPDF && (
              <div className="space-y-3">
                <p className="text-sm text-navy-600 text-center">
                  Choose how you'd like to use {petData.name}'s resume:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handlePdfAction('view')}
                    variant="outline"
                    className="border-gold-500 text-gold-600 hover:bg-gold-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    onClick={() => handlePdfAction('download')}
                    className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {isGeneratingPDF && (
              <div className="text-center py-6">
                <div className="w-8 h-8 animate-spin mx-auto mb-3 text-gold-500">⏳</div>
                <p className="text-navy-600">Generating pet resume PDF...</p>
              </div>
            )}
            
            {/* Generated PDF Actions */}
            {generatedPdfBlob && !isGeneratingPDF && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gold-500/30 shadow-sm">
                  <h4 className="font-bold text-navy-900 mb-3">Pet Resume PDF</h4>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center mb-3">
                    <Button
                      onClick={() => {
                        const url = URL.createObjectURL(generatedPdfBlob);
                        window.open(url, '_blank')?.focus();
                        URL.revokeObjectURL(url);
                      }}
                      variant="outline"
                      className="border-gold-500 text-gold-600 hover:bg-gold-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View PDF
                    </Button>
                    <Button
                      onClick={() => {
                        const fileName = `${petData.name}_Resume.pdf`;
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(generatedPdfBlob);
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                        toast.success("PDF downloaded successfully!");
                      }}
                      className="bg-gradient-to-r from-gold-500 to-gold-400 text-navy-900 hover:from-gold-400 hover:to-gold-300"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
              📱 QR Code for {petData.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <p className="text-sm text-navy-600">
              Scan this QR code to view {petData.name}'s public profile
            </p>
            
            <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-gold-500/30">
              <img 
                src={generateQRCodeUrl(generatePublicProfileUrl(petData.id), 200)}
                alt={`QR Code for ${petData.name}'s profile`}
                className="w-48 h-48"
              />
            </div>
            
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs text-gray-600 break-all">
                {generatePublicProfileUrl(petData.id)}
              </p>
            </div>
            
            <Button
              onClick={async () => {
                const profileUrl = generatePublicProfileUrl(petData.id);
                try {
                  await navigator.clipboard.writeText(profileUrl);
                  toast.success("Profile URL copied to clipboard!");
                } catch (error) {
                  toast.error("Failed to copy URL to clipboard");
                }
              }}
              variant="outline"
              className="border-gold-500 text-gold-600 hover:bg-gold-50"
            >
              Copy Profile URL
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Credentials Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
              🔗 Share {petData.name}'s Credentials
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <SocialShareButtons 
              petName={petData.name}
              petId={petData.id}
              context="credentials"
              defaultOpenOptions={true}
              shareUrlOverride={`${window.location.origin}/credentials/${petData.id}`}
            />

            <div className="space-y-3 text-center">
              <p className="text-sm text-navy-600">Or scan to open credentials</p>
              <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-gold-500/30">
                <img 
                  src={generateQRCodeUrl(`${window.location.origin}/credentials/${petData.id}`, 200)}
                  alt={`QR Code for ${petData.name}'s credentials`}
                  className="w-48 h-48"
                />
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-xs text-gray-600 break-all">
                  {`${window.location.origin}/credentials/${petData.id}`}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Reviews Dialog */}
      <Dialog open={isReviewsShareDialogOpen} onOpenChange={setIsReviewsShareDialogOpen}>
        <DialogContent className="max-w-md bg-[#f8f8f8]">
          <DialogHeader>
            <DialogTitle className="font-bold text-navy-900 border-b-2 border-gold-500 pb-2">
              🔗 Share {petData.name}'s Reviews
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <SocialShareButtons 
              petName={petData.name}
              petId={petData.id}
              context="reviews"
              defaultOpenOptions={true}
              shareUrlOverride={`${window.location.origin}/reviews/${petData.id}`}
            />

            <div className="space-y-3 text-center">
              <p className="text-sm text-navy-600">Or scan to open reviews</p>
              <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-gold-500/30">
                <img 
                  src={generateQRCodeUrl(`${window.location.origin}/reviews/${petData.id}`, 200)}
                  alt={`QR Code for ${petData.name}'s reviews`}
                  className="w-48 h-48"
                />
              </div>
              <div className="bg-white p-3 rounded border border-gray-200">
                <p className="text-xs text-gray-600 break-all">
                  {`${window.location.origin}/reviews/${petData.id}`}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
