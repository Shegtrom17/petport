import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Award, GraduationCap, Trophy, MessageSquare, Sparkles, Heart, Activity, Shield, Phone } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { CertificationBanner } from "@/components/CertificationBanner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { fetchPetDetails } from "@/services/petService";

const FINNEGAN_ID = "297d1397-c876-4075-bf24-41ee1862853a";

export default function DemoResume() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const pet = await fetchPetDetails(FINNEGAN_ID);
      setData(pet);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Unable to load demo data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-cream">
      <MetaTags 
        title={`${data.name}'s Professional Resume - Live PetPort Demo`}
        description={`Experience a real PetPort Whiteboard - ${data.name}'s professional pet resume with certifications, training, achievements, and reviews`}
        image="https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/og-images/resume-og-1mb.png"
        url={`https://petport.app/demo/resume`}
      />

      {/* Live Demo Banner */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white py-3 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">✨ Live Demo – Real PetPort Whiteboard</span>
          <Button 
            onClick={() => navigate('/auth')}
            variant="outline" 
            size="sm"
            className="ml-4 bg-white text-brand-primary hover:bg-brand-cream border-white"
          >
            Create Your Pet's Whiteboard Free
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
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

        {/* Support Animal Status */}
        <SupportAnimalBanner status={data.supportAnimalStatus || null} />

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
              {data.bio || `${data.name} is a wonderful ${data.breed?.toLowerCase()} with a gentle temperament and friendly disposition.`}
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
          <CertificationBanner certificationData={data.certifications && data.certifications.length > 0 ? data.certifications[0] : undefined} />
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
        {data.reviews && data.reviews.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <Star className="w-5 h-5 text-primary" />
                References & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.reviews.map((review, idx) => (
                <div key={idx} className="p-4 rounded border">
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
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg p-8 text-center text-white mb-6">
          <h2 className="text-2xl font-bold mb-3">Ready to Create Your Pet's Professional Whiteboard?</h2>
          <p className="mb-4 text-white/90">Join thousands of pet owners showcasing their pets' achievements</p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-white text-brand-primary hover:bg-brand-cream"
          >
            Create Your Free Whiteboard
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm pb-8">
          <div className="border-t border-sage-200 mb-6 max-w-md mx-auto" />
          <p>This is a live demo of {data.name}'s real PetPort resume.</p>
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
    </div>
  );
}
