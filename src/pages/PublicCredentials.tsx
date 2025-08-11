import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Award, GraduationCap, Trophy, Activity } from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { SupportAnimalBanner } from "@/components/SupportAnimalBanner";
import { CertificationBanner } from "@/components/CertificationBanner";
import { VaccinationGuideButton } from "@/components/VaccinationGuide";
import { fetchPetDetails } from "@/services/petService";

interface PublicCredentialsData {
  id: string;
  name: string;
  species?: string | null;
  breed?: string | null;
  is_public?: boolean;
  supportAnimalStatus?: string | null;
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
  badges?: string[];
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
}

export default function PublicCredentials() {
  const { petId } = useParams();
  const [data, setData] = useState<PublicCredentialsData | null>(null);
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
            <CardTitle>Credentials Unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This pet's credentials are not publicly available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const certification = data.certifications && data.certifications.length > 0 ? data.certifications[0] : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
      <MetaTags 
        title={`${data.name} Credentials | PetPort`}
        description={`Professional credentials for ${data.name}: certifications, training, badges.`}
        url={`${window.location.origin}/credentials/${data.id}`}
      />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
            {data.name} – Credentials
          </h1>
          <p className="mt-2 text-navy-600">
            {data.species || ''} {data.breed ? `• ${data.breed}` : ''}
          </p>
        </header>

        {/* Vaccination Guide */}
        <div className="flex justify-center mb-6">
          <VaccinationGuideButton />
        </div>

        {/* Support Animal Status */}
        <SupportAnimalBanner status={data.supportAnimalStatus || null} />

        {/* Certification Banner */}
        <div className="my-4">
          <CertificationBanner certificationData={certification} />
        </div>

        {/* Certifications Detail */}
        {data.certifications && data.certifications.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <Shield className="w-5 h-5 text-primary" />
                Certifications
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
                Training & Education
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
                  {e.description && <div className="text-sm text-muted-foreground">{e.description}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Badges */}
        {data.badges && data.badges.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-navy-900">
                <Award className="w-5 h-5 text-primary" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {data.badges.map((b, idx) => (
                <Badge key={idx} variant="outline">{b}</Badge>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
