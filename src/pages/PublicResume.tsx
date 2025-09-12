import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, GraduationCap, Trophy, Activity, Star, MapPin, Heart, Phone } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { CertificationBanner } from "@/components/CertificationBanner";

import { fetchPetDetails } from "@/services/petService";

interface PublicResumeData {
  id: string;
  name: string;
  species?: string | null;
  breed?: string | null;
  age?: string | null;
  sex?: string | null;
  weight?: string | null;
  height?: string | null;
  microchip_id?: string | null;
  registration_number?: string | null;
  petport_id?: string | null;
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
    reviewerName: string;
    reviewerContact?: string | null;
    rating: number;
    text?: string | null;
    date?: string | null;
    location?: string | null;
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
  const [data, setData] = useState<PublicResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!petId) return;
      const pet = await fetchPetDetails(petId);
      setData(pet);
      setLoading(false);
    };
    load();
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
      <MetaTags 
        title={`${data.name} Resume | PetPort`}
        description={`Professional resume for ${data.name}: certifications, training, achievements, and experience.`}
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
          <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
            {data.name} – Resume
          </h1>
          <p className="mt-2 text-navy-600">
            {data.species || ''} {data.breed ? `• ${data.breed}` : ''}
          </p>
        </header>

        {/* Pet Information Section */}
        <Card className="mb-6">
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
                <p className="font-semibold">{data.name}</p>
              </div>
              {data.species && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Species:</span>
                  <p className="font-semibold">{data.species}</p>
                </div>
              )}
              {data.breed && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Breed:</span>
                  <p className="font-semibold">{data.breed}</p>
                </div>
              )}
              {data.age && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Age:</span>
                  <p className="font-semibold">{data.age}</p>
                </div>
              )}
              {data.sex && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Sex:</span>
                  <p className="font-semibold">{data.sex}</p>
                </div>
              )}
              {data.weight && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Weight:</span>
                  <p className="font-semibold">{data.weight}</p>
                </div>
              )}
              {data.height && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Height:</span>
                  <p className="font-semibold">{data.height}</p>
                </div>
              )}
              {data.registration_number && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Registration ID:</span>
                  <p className="font-semibold">{data.registration_number}</p>
                </div>
              )}
              {data.microchip_id && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Microchip ID:</span>
                  <p className="font-semibold">{data.microchip_id}</p>
                </div>
              )}
              {data.petport_id && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">PetPort ID:</span>
                  <p className="font-semibold">{data.petport_id}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
    </div>
  );
}