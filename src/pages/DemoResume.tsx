import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, MapPin, Award, GraduationCap, Trophy, MessageSquare, Sparkles } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { CertificationBanner } from "@/components/CertificationBanner";
import { FINN_DEMO_DATA } from "@/data/finnDemoData";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function DemoResume() {
  const navigate = useNavigate();
  const data = FINN_DEMO_DATA;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-cream">
      <MetaTags 
        title={`${data.name}'s Professional Resume - Live PetPort Demo`}
        description={`Experience a real PetPort Whiteboard - ${data.name}'s professional pet resume with certifications, training, achievements, and reviews`}
        image="https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/og-images/resume-og-1mb.png"
        url={`https://petport.app/demo/resume`}
      />

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white py-3 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">✨ Live Demo - Experience a Real PetPort Whiteboard</span>
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <img
              src={data.photo_url}
              alt={data.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-brand-primary shadow-lg"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-brand-primary mb-2">{data.name}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                <Badge variant="secondary">{data.species}</Badge>
                {data.breed && <Badge variant="outline">{data.breed}</Badge>}
                <Badge variant="outline">{data.age} years old</Badge>
                <Badge variant="outline">{data.weight} lbs</Badge>
              </div>
              <p className="text-lg text-brand-primary-dark mb-2">
                PetPort ID: <span className="font-mono font-semibold">{data.petport_id}</span>
              </p>
              {data.microchip_id && (
                <p className="text-sm text-muted-foreground">
                  Microchip: {data.microchip_id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Support Animal Banner */}
        {data.professional_data?.support_animal_status === 'therapy_dog' && (
          <SupportAnimalBanner status="therapy_dog" />
        )}

        {/* Certification Banner */}
        {data.certifications && data.certifications.length > 0 && (
          <CertificationBanner certificationData={data.certifications[0]} />
        )}

        {/* About Section */}
        {data.bio && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-brand-primary" />
                About {data.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-brand-primary-dark leading-relaxed">{data.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Experience & Activities */}
        {data.experiences && data.experiences.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-primary" />
                Experience & Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="border-l-4 border-brand-primary pl-4">
                  <h3 className="font-semibold text-lg text-brand-primary">{exp.activity}</h3>
                  <p className="text-brand-primary-dark mt-1">{exp.description}</p>
                  {exp.contact && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Contact: {exp.contact}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Professional Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-primary" />
                Professional Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="border rounded-lg p-4 bg-brand-cream/30">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-brand-primary">{cert.type}</h3>
                    <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                      {cert.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-brand-primary-dark">
                    <strong>Issuer:</strong> {cert.issuer}
                  </p>
                  {cert.certification_number && (
                    <p className="text-sm text-brand-primary-dark">
                      <strong>Certificate #:</strong> {cert.certification_number}
                    </p>
                  )}
                  {cert.issue_date && (
                    <p className="text-sm text-brand-primary-dark">
                      <strong>Issued:</strong> {new Date(cert.issue_date).toLocaleDateString()}
                    </p>
                  )}
                  {cert.expiry_date && (
                    <p className="text-sm text-brand-primary-dark">
                      <strong>Expires:</strong> {new Date(cert.expiry_date).toLocaleDateString()}
                    </p>
                  )}
                  {cert.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{cert.notes}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notable Training */}
        {data.training && data.training.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-brand-primary" />
                Notable Training
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.training.map((training) => (
                <div key={training.id} className="border-l-4 border-brand-secondary pl-4">
                  <h3 className="font-semibold text-brand-primary">{training.course}</h3>
                  <p className="text-sm text-brand-primary-dark">
                    {training.facility}
                  </p>
                  {training.completed && (
                    <p className="text-sm text-muted-foreground">
                      Completed: {new Date(training.completed).toLocaleDateString()}
                    </p>
                  )}
                  {training.phone && (
                    <p className="text-sm text-muted-foreground">
                      Contact: {training.phone}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notable Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-brand-primary" />
                Notable Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.achievements.map((achievement) => (
                <div key={achievement.id} className="border rounded-lg p-4 bg-amber-50">
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-brand-primary">{achievement.title}</h3>
                      <p className="text-sm text-brand-primary-dark mt-1">{achievement.description}</p>
                      {achievement.date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* References & Reviews */}
        {data.reviews && data.reviews.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-brand-primary" />
                References & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-brand-primary">{review.reviewer_name}</h3>
                      {review.location && (
                        <p className="text-sm text-muted-foreground">{review.location}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-brand-primary-dark mb-2">{review.text}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {review.type && <Badge variant="outline">{review.type}</Badge>}
                    {review.date && <span>{new Date(review.date).toLocaleDateString()}</span>}
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

        {/* Branding Footer */}
        <div className="text-center py-6 border-t">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a
              href="https://petport.app"
              className="text-brand-primary hover:text-brand-secondary font-semibold"
              target="_blank"
              rel="noopener noreferrer"
            >
              PetPort.app
            </a>
            {" "}— The Professional Whiteboard for Pets
          </p>
        </div>
      </div>
    </div>
  );
}
