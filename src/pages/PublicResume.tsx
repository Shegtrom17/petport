import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AzureButton } from "@/components/ui/azure-button";
import { Button } from "@/components/ui/button";
import { Shield, Award, GraduationCap, Trophy, Activity, Star, MapPin, Heart, Phone, Mail, X } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { CertificationBanner } from "@/components/CertificationBanner";
import { ContactsDisplay } from "@/components/ContactsDisplay";
import { ContactOwnerModal } from "@/components/ContactOwnerModal";
import { AddReviewForm } from "@/components/AddReviewForm";
import { smoothScrollIntoViewIfNeeded } from "@/utils/smoothScroll";
import { PublicPageQRCode } from "@/components/PublicPageQRCode";

import { fetchPetDetails } from "@/services/petService";
import { supabase } from "@/integrations/supabase/client";

interface PublicResumeData {
  id: string;
  name: string;
  species?: string | null;
  breed?: string | null;
  age?: string | null;
  sex?: string | null;
  weight?: string | null;
  height?: string | null;
  microchipId?: string | null;
  registrationNumber?: string | null;
  petPortId?: string | null;
  state?: string | null;
  county?: string | null;
  is_public?: boolean;
  supportAnimalStatus?: string | null;
  photoUrl?: string;
  bio?: string | null;
  certifications?: Array<{
    id: string;
    type: string;
    status: string;
    issuer?: string | null;
    certification_number?: string | null;
    issue_date?: string | null;
    expiry_date?: string | null;
    notes?: string | null;
  }>;
  training?: Array<{
    course: string;
    facility?: string | null;
    phone?: string | null;
    completed?: string | null;
  }>;
  achievements?: Array<{
    title: string;
    description?: string | null;
  }>;
  experiences?: Array<{
    activity: string;
    description?: string | null;
    contact?: string | null;
  }>;
  reviews?: Array<{
    id: string;
    reviewerName: string;
    reviewerContact?: string | null;
    rating: number;
    text?: string | null;
    date?: string | null;
    location?: string | null;
    response?: {
      response_text: string;
      created_at: string;
    } | null;
  }>;
  travel_locations?: Array<{
    id: string;
    name: string;
    type: string;
    code?: string | null;
    date_visited?: string | null;
    photo_url?: string | null;
    notes?: string | null;
  }>;
}

export default function PublicResume() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<PublicResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showAddReview, setShowAddReview] = useState(false);
  const reviewFormRef = useRef<HTMLDivElement>(null);

  const handleClose = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Authenticated user previewing their own LiveLink
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get('returnTo');
      
      if (returnTo && petId) {
        // Navigate directly to the specific tab they came from
        navigate(`/profile?pet=${petId}&tab=${returnTo}`);
      } else if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/profile');
      }
    } else {
      // Anonymous visitor logic (unchanged)
      const referrer = document.referrer;
      const isFromDemoOrMarketing = referrer.includes('/demos') || 
                                    referrer.includes('/lost-pet-features') ||
                                    referrer.includes('/learn');
      
      if (window.history.length > 1 && !isFromDemoOrMarketing) {
        navigate(-1);
      } else if (isFromDemoOrMarketing) {
        navigate('/demos');
      } else {
        navigate('/');
      }
    }
  };

  const loadPetData = async () => {
    if (!petId) return;
    const pet = await fetchPetDetails(petId);
    setData(pet);
    setLoading(false);
  };

  const handleOpenReviewForm = () => {
    setShowAddReview(true);
    setTimeout(() => {
      if (reviewFormRef.current) {
        smoothScrollIntoViewIfNeeded(reviewFormRef.current);
      }
    }, 100);
  };

  const handleReviewSuccess = () => {
    setShowAddReview(false);
    loadPetData();
  };

  useEffect(() => {
    loadPetData();
  }, [petId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data || data.is_public === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>Resume Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This pet's resume is not publicly available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const certification = data.certifications && data.certifications.length > 0 ? data.certifications[0] : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
      {/* Close Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="bg-white/80 hover:bg-white shadow-md"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <MetaTags
        title={`See ${data.name}'s Resume | PetPort`}
        description={`Professional resume for ${data.name}: certifications, training, achievements, and experience.`}
        image="https://pub-a7c2c18b8d6143b9a256105ef44f2da0.r2.dev/og-resume.png"
        url={`${window.location.origin}/resume/${data.id}`}
      />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          {data.photoUrl && (
            <div className="mb-6">
              <img 
                src={data.photoUrl} 
                alt={data.name}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-sage-200"
              />
            </div>
          )}
          <h1 className="text-3xl font-sans font-bold text-navy-900 mb-2">
            {data.name}'s Resume
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 text-navy-600 mb-2">
            {data.breed && <Badge variant="secondary">{data.breed}</Badge>}
            {data.species && <Badge variant="secondary">{data.species}</Badge>}
            {data.age && <Badge variant="secondary">Age: {data.age}</Badge>}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 text-navy-600 mb-4">
            {data.sex && <Badge variant="secondary">Sex: {data.sex}</Badge>}
            {data.weight && <Badge variant="secondary">Weight: {data.weight}</Badge>}
            {data.height && <Badge variant="secondary">Height: {data.height}</Badge>}
            {data.registrationNumber && <Badge variant="secondary">Registration: {data.registrationNumber}</Badge>}
            {data.microchipId && <Badge variant="secondary">Microchip: {data.microchipId}</Badge>}
          </div>
          {(data.state || data.county) && (
            <div className="flex items-center justify-center gap-1 text-sm text-navy-500">
              <MapPin className="w-4 h-4" />
              <span>{[data.county, data.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </header>

        {/* Contact Owner Button */}
        <Card className="mb-6 bg-sage-50/50 border-sage-200">
          <CardContent className="pt-6 text-center">
            <p className="text-sm text-navy-600 mb-3">
              Interested in working with {data.name}? Send a message to the owner.
            </p>
            <AzureButton 
              onClick={() => setIsContactModalOpen(true)}
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Owner
            </AzureButton>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <PublicPageQRCode
          url={window.location.href}
          petName={data.name}
          pageType="Resume"
          color="#5691af"
          title={`Scan to View ${data.name}'s Professional Resume`}
          description="Access credentials, training, certifications, and professional experience"
        />

        {/* Support Animal Status */}
        <SupportAnimalBanner status={data.supportAnimalStatus || null} />

        {/* Veterinary Contact Only */}
        <div className="mb-6">
          <ContactsDisplay 
            petId={data.id} 
            hideHeader={false} 
            fallbackPetData={data}
            pageContext="resume"
          />
        </div>

        {/* About Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-navy-900">
              <Heart className="w-5 h-5 text-red-500" />
              About {data.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              {data.bio || `${data.name} is a wonderful ${data.breed?.toLowerCase()} with a gentle temperament and friendly disposition. Known for being well-behaved and great with people of all ages. An ideal companion for any setting.`}
            </p>
          </CardContent>
        </Card>

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <Activity className="w-5 h-5 text-primary" />
                Experience & Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.experiences.map((e, idx) => (
                <div key={idx} className="p-3 rounded border">
                  <div className="font-medium">{e.activity}</div>
                  {e.description && <div className="text-sm text-muted-foreground mb-2">{e.description}</div>}
                  {e.contact && (
                    <div className="flex items-center space-x-2 text-sm text-primary">
                      <Phone className="w-3 h-3" />
                      <span>Contact: {e.contact}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Certification Banner */}
        <div className="my-4">
          <CertificationBanner certificationData={certification} />
        </div>

        {/* Professional Certifications Detail */}
        {data.certifications && data.certifications.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <Shield className="w-5 h-5 text-primary" />
                Professional Certification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.certifications.map((c) => (
                <div key={c.id} className="p-4 rounded border">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="secondary">{c.type}</Badge>
                    <Badge>{c.status}</Badge>
                    {c.certification_number && (
                      <span className="text-sm text-muted-foreground">#{c.certification_number}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {c.issuer ? `${c.issuer}` : ''}
                    {c.issue_date ? ` • Issued: ${new Date(c.issue_date).toLocaleDateString()}` : ''}
                    {c.expiry_date ? ` • Expires: ${new Date(c.expiry_date).toLocaleDateString()}` : ''}
                  </p>
                  {c.notes && <p className="mt-2 text-sm">{c.notes}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Training */}
        {data.training && data.training.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <GraduationCap className="w-5 h-5 text-primary" />
                Notable Training
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.training.map((t, idx) => (
                <div key={idx} className="p-3 rounded border">
                  <div className="font-medium">{t.course}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.facility ? `${t.facility}` : ''}
                    {t.phone ? ` • ${t.phone}` : ''}
                    {t.completed ? ` • Completed: ${t.completed}` : ''}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <Trophy className="w-5 h-5 text-primary" />
                Notable Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.achievements.map((a, idx) => (
                <div key={idx} className="p-3 rounded border">
                  <div className="font-medium">{a.title}</div>
                  {a.description && <div className="text-sm text-muted-foreground">{a.description}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}


        {/* References & Reviews */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-navy-900">
              <Star className="w-5 h-5 text-primary" />
              References & Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Leave Review Button */}
            {!showAddReview && (
              <AzureButton 
                onClick={handleOpenReviewForm}
                className="w-full"
              >
                <Star className="w-4 h-4 mr-2" />
                Leave a Review for {data.name}
              </AzureButton>
            )}

            {/* Review Form */}
            {showAddReview && (
              <div ref={reviewFormRef}>
                <AddReviewForm
                  petId={data.id}
                  petName={data.name}
                  onClose={() => setShowAddReview(false)}
                  onSuccess={handleReviewSuccess}
                />
              </div>
            )}

            {/* Existing Reviews */}
            {data.reviews && data.reviews.length > 0 ? (
              data.reviews.map((review, idx) => (
                <div key={idx} className="p-4 rounded border space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{review.reviewerName}</div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-500 fill-current' : 'text-yellow-300'}`} />
                      ))}
                    </div>
                  </div>
                  {review.text && (
                    <p className="text-sm text-muted-foreground mb-2">{review.text}</p>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      {review.location && <span>{review.location}</span>}
                      {review.date && <span> • {review.date}</span>}
                    </div>
                    {review.reviewerContact && (
                      <div className="flex items-center space-x-1 text-primary">
                        <Phone className="w-3 h-3" />
                        <span>Contact: {review.reviewerContact}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Owner's Response */}
                  {review.response && (
                    <div className="mt-3 pt-3 border-t bg-sage-50/50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">Owner's Response</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.response.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-navy-700">{review.response.response_text}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              !showAddReview && (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="mb-3">No reviews yet. Be the first to leave a reference!</p>
                  <Button 
                    onClick={handleOpenReviewForm}
                    variant="default"
                  >
                    Write First Review
                  </Button>
                </div>
              )
            )}
          </CardContent>
        </Card>

        {/* Travel History */}
        {data.travel_locations && data.travel_locations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <MapPin className="w-5 h-5 text-primary" />
                Travel History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.travel_locations.map((location, idx) => (
                <div key={idx} className="p-3 rounded border">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="font-medium">{location.name}</div>
                      <div className="text-sm text-muted-foreground">
                        <Badge variant="outline" className="mr-2">{location.type}</Badge>
                        {location.code && <span className="mr-2">Code: {location.code}</span>}
                        {location.date_visited && <span>Visited: {location.date_visited}</span>}
                      </div>
                      {location.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{location.notes}</p>
                      )}
                    </div>
                    {location.photo_url && (
                      <img 
                        src={location.photo_url} 
                        alt={location.name}
                        className="w-16 h-16 rounded object-cover ml-3"
                      />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm pb-8">
          <div className="border-t border-sage-200 mb-6 max-w-md mx-auto" />
          <p>This is a public resume for {data.name}.</p>
          <p className="mt-2">
            Generated by{" "}
            <a 
              href={window.location.origin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              PetPort.app
            </a>
            {" "}— Be ready for travel, sitters, lost pet, and emergencies. Try it free.
          </p>
        </div>

      </main>

      <ContactOwnerModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        petId={data.id}
        petName={data.name}
        pageType="resume"
      />
    </div>
  );
}