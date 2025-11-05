import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Phone, Mail, AlertCircle, FileText, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MetaTags } from "@/components/MetaTags";

export default function PublicGuardian() {
  const { petId, accessToken } = useParams();
  const [guardian, setGuardian] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGuardianData();
  }, [petId, accessToken]);

  const fetchGuardianData = async () => {
    if (!petId || !accessToken) {
      setError("Invalid guardian link");
      setLoading(false);
      return;
    }

    try {
      // Fetch guardian data with token validation
      const { data: guardianData, error: guardianError } = await supabase
        .from("pet_guardians")
        .select("*")
        .eq("pet_id", petId)
        .eq("access_token", accessToken)
        .maybeSingle();

      if (guardianError || !guardianData) {
        setError("Invalid or expired guardian link");
        setLoading(false);
        return;
      }

      setGuardian(guardianData);

      // Update last accessed timestamp
      await supabase
        .from("pet_guardians")
        .update({ last_accessed_at: new Date().toISOString() })
        .eq("id", guardianData.id);

      // Fetch pet data (public access)
      const { data: petData, error: petError } = await supabase
        .from("pets")
        .select(`
          *,
          pet_photos (*),
          care_instructions (*),
          medical (*),
          documents (*),
          pet_contacts (*)
        `)
        .eq("id", petId)
        .single();

      if (petError) throw petError;
      setPet(petData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading guardian information...</p>
      </div>
    );
  }

  if (error || !guardian || !pet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error || "Unable to load guardian information"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const authorizationLabel = guardian.authorization_level === "full_custody" 
    ? "Full Custody" 
    : "Medical Only";

  return (
    <>
      <MetaTags
        title={`Guardian Access - ${pet.name}`}
        description={`Emergency guardian information for ${pet.name}`}
        url={window.location.href}
      />

      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-16 w-16 text-primary" />
              </div>
              <CardTitle className="text-3xl">Guardian Access Portal</CardTitle>
              <CardDescription>
                You have been designated as the emergency guardian for {pet.name}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Pet Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Pet Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {pet.pet_photos?.[0]?.photo_url && (
                  <img
                    src={pet.pet_photos[0].photo_url}
                    alt={pet.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                )}
                <div>
                  <h2 className="text-2xl font-bold">{pet.name}</h2>
                  <p className="text-muted-foreground">
                    {pet.species} • {pet.breed} • {pet.age}
                  </p>
                </div>
              </div>

              {pet.microchip_id && (
                <div>
                  <span className="font-semibold">Microchip ID:</span> {pet.microchip_id}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Authorization Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your Authorization Level
                <Badge variant={guardian.authorization_level === "full_custody" ? "default" : "secondary"}>
                  {authorizationLabel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {guardian.authorization_level === "full_custody" 
                    ? "You are authorized to take full custody of this pet and make all decisions regarding their care."
                    : "You are authorized to make emergency medical decisions for this pet."}
                </AlertDescription>
              </Alert>

              {guardian.financial_limit > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">Emergency Medical Spending Limit:</p>
                  <p className="text-2xl font-bold text-primary">${guardian.financial_limit}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You can authorize emergency medical expenses up to this amount without
                    contacting the owner.
                  </p>
                </div>
              )}

              {guardian.special_instructions && (
                <div>
                  <h4 className="font-semibold mb-2">Special Instructions from Owner:</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {guardian.special_instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          {pet.pet_contacts && pet.pet_contacts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pet.pet_contacts.map((contact: any) => (
                  <div key={contact.id} className="p-3 border rounded-lg">
                    <p className="font-semibold">{contact.contact_name}</p>
                    <p className="text-sm text-muted-foreground">{contact.contact_type}</p>
                    <p className="text-sm">{contact.contact_phone}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Care Instructions */}
          {pet.care_instructions && (
            <Card>
              <CardHeader>
                <CardTitle>Care Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pet.care_instructions.feeding_schedule && (
                  <div>
                    <h4 className="font-semibold">Feeding Schedule:</h4>
                    <p className="text-muted-foreground">{pet.care_instructions.feeding_schedule}</p>
                  </div>
                )}
                {pet.care_instructions.allergies && (
                  <div>
                    <h4 className="font-semibold text-destructive">Allergies:</h4>
                    <p className="text-muted-foreground">{pet.care_instructions.allergies}</p>
                  </div>
                )}
                {pet.care_instructions.behavioral_notes && (
                  <div>
                    <h4 className="font-semibold">Behavioral Notes:</h4>
                    <p className="text-muted-foreground">{pet.care_instructions.behavioral_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Medical Information */}
          {pet.medical && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pet.medical.medical_alert && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>MEDICAL ALERT ACTIVE</AlertDescription>
                  </Alert>
                )}
                {pet.medical.medical_conditions && (
                  <div>
                    <h4 className="font-semibold">Medical Conditions:</h4>
                    <p className="text-muted-foreground">{pet.medical.medical_conditions}</p>
                  </div>
                )}
                {pet.medical.medications && pet.medical.medications.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Medications:</h4>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {pet.medical.medications.map((med: string, idx: number) => (
                        <li key={idx}>{med}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {pet.documents && pet.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Important Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pet.documents.map((doc: any) => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted transition"
                    >
                      <FileText className="h-4 w-4" />
                      <span>{doc.name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted">
            <CardContent className="pt-6">
              <p className="text-sm text-center text-muted-foreground">
                This guardian access portal is provided by PetPort. Keep this link secure
                and confidential. You will be notified if the owner updates any information.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
