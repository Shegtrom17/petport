import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Shield, Heart, Phone, Mail, Award, AlertTriangle, MapPin, GraduationCap, Trophy, Activity, Edit, Users, Eye } from "lucide-react";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { PetResumeEditForm } from "@/components/PetResumeEditForm";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { PrivacyHint } from "@/components/PrivacyHint";
import { FloatingAIButton } from "@/components/FloatingAIButton";
import { AIBioAssistantModal } from "@/components/AIBioAssistantModal";
import { QuickShareHub } from "@/components/QuickShareHub";

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
    certifications?: Array<{
      type: string;
      status: string;
      issuer?: string;
      certification_number?: string;
      issue_date?: string;
      expiry_date?: string;
      notes?: string;
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
  handlePetUpdate?: () => Promise<void>;
}

export const PetResumeSection = ({ petData, onUpdate, handlePetUpdate }: PetResumeSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIBioModalOpen, setIsAIBioModalOpen] = useState(false);

  const averageRating = petData.reviews?.length 
    ? petData.reviews.reduce((sum, review) => sum + review.rating, 0) / petData.reviews.length 
    : 0;


  const handleEditSave = () => {
    setIsEditModalOpen(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">

      {/* Support Animal Status Banner */}
      <SupportAnimalBanner status={petData.supportAnimalStatus || null} />

      {/* Pet Resume Management Hub */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6 space-y-4">
          {/* Hub Title */}
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-[#5691af]" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Pet Resume</h2>
              <p className="text-muted-foreground">Manage {petData.name}'s professional credentials</p>
            </div>
          </div>

          {/* Guidance Section */}
          <div className="p-4 bg-blue-50 border-l-4 border-l-blue-500 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Resume Management Hub:</strong> Add training courses, achievements, certifications, 
              and work experience. Request references from veterinarians, trainers, or caretakers. 
              Edit existing reviews and references. All information displays below for easy review and sharing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full h-14 text-lg text-white"
              size="lg"
            >
              <Edit className="w-5 h-5 mr-2" />
              Edit Resume
            </Button>
            
            <Button
              onClick={() => window.open(`/resume/${petData.id}?returnTo=resume`, '_blank')}
              variant="azure"
              className="w-full h-14 text-lg"
            >
              <Eye className="w-5 h-5 mr-2" />
              Preview Resume LiveLink
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto with-keyboard-padding">
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

      {/* Quick Share Hub */}
      <QuickShareHub 
        petData={petData} 
        isLost={false}
      />

      {/* Photos Section */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Photos */}
            <div className="flex flex-col space-y-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-4 border-gray-300 shadow-lg">
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

      {/* Pet Information Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-900">
            <Shield className="w-5 h-5 text-primary" />
            Pet Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Name:</span>
              <p className="font-semibold">{petData.name}</p>
            </div>
            {petData.species && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Species:</span>
                <p className="font-semibold">{petData.species}</p>
              </div>
            )}
            {petData.breed && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Breed:</span>
                <p className="font-semibold">{petData.breed}</p>
              </div>
            )}
            {petData.age && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Age:</span>
                <p className="font-semibold">{petData.age}</p>
              </div>
            )}
            {(petData as any).sex && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Sex:</span>
                <p className="font-semibold">{(petData as any).sex}</p>
              </div>
            )}
            {petData.weight && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Weight:</span>
                <p className="font-semibold">{petData.weight}</p>
              </div>
            )}
            {(petData as any).height && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Height:</span>
                <p className="font-semibold">{(petData as any).height}</p>
              </div>
            )}
            {(petData as any).registration_number && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Registration ID:</span>
                <p className="font-semibold">{(petData as any).registration_number}</p>
              </div>
            )}
            {petData.microchipId && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Microchip ID:</span>
                <p className="font-semibold">{petData.microchipId}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground">PetPort ID:</span>
              <p className="font-semibold">{petData.petPassId}</p>
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
            {petData.bio || `${petData.name} is a wonderful ${(petData.breed?.toLowerCase() || 'pet')} with a gentle temperament and friendly disposition. Known for being well-behaved and great with people of all ages. An ideal companion for any setting.`}
          </p>
        </CardContent>
      </Card>

      {/* Experience Section */}
      {petData.experiences && petData.experiences.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border-l-4 border-brand-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-brand-primary" />
              <span>Experience & Activities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {petData.experiences.map((exp, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">{exp.activity}</h4>
                  <p className="text-gray-600 text-sm mb-2">{exp.description}</p>
                  {exp.contact && (
                    <div className="flex items-center space-x-2 text-sm text-brand-primary">
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
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border-l-4 border-brand-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-brand-primary" />
              <span>Notable Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {petData.achievements.map((achievement, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-2">{achievement.title}</h4>
                  <p className="text-gray-700 text-sm">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training & Education Section */}
      {petData.training && petData.training.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border-l-4 border-brand-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-brand-primary" />
              <span>Training</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {petData.training.map((course, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800">{course.course}</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3 h-3 text-brand-primary" />
                      <span>{course.facility}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-brand-primary" />
                      <span>{course.phone}</span>
                    </div>
                    <p className="text-xs text-gray-600">Completed: {course.completed}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications Section */}
      {petData.certifications && petData.certifications.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm border-l-4 border-brand-primary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-brand-primary" />
              <span>Professional Certifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {petData.certifications.map((cert, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{cert.type}</h4>
                    <Badge variant={cert.status === 'active' ? 'default' : cert.status === 'expired' ? 'destructive' : 'secondary'}>
                      {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                    </Badge>
                  </div>
                  {cert.issuer && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Issuer:</strong> {cert.issuer}
                    </p>
                  )}
                  {cert.certification_number && (
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Certificate #:</strong> {cert.certification_number}
                    </p>
                  )}
                  <div className="flex gap-4 text-xs text-gray-600 mt-2">
                    {cert.issue_date && (
                      <span><strong>Issued:</strong> {new Date(cert.issue_date).toLocaleDateString()}</span>
                    )}
                    {cert.expiry_date && (
                      <span><strong>Expires:</strong> {new Date(cert.expiry_date).toLocaleDateString()}</span>
                    )}
                  </div>
                  {cert.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{cert.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Bio Assistant Modal */}
      <AIBioAssistantModal
        open={isAIBioModalOpen}
        onOpenChange={setIsAIBioModalOpen}
        petData={petData}
      />

      {/* Floating AI Button */}
      <FloatingAIButton 
        onClick={() => setIsAIBioModalOpen(true)} 
        label="AI Bio & Resume Assistant"
        description="Get writing help & suggestions"
      />
    </div>
  );
};
