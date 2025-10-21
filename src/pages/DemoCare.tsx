import { useEffect, useState } from "react";
import { MetaTags } from "@/components/MetaTags";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Utensils, Clock, Pill, Heart, AlertCircle, Phone, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FINNEGAN_ID = "297d1397-c876-4075-bf24-41ee1862853a";

export default function DemoCare() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDemoData = async () => {
      try {
        // Fetch pet details
        const { data: pet, error: petError } = await supabase
          .from("pets")
          .select("*")
          .eq("id", FINNEGAN_ID)
          .single();

        if (petError) throw petError;

        // Fetch care instructions
        const { data: careInstructions } = await supabase
          .from("care_instructions")
          .select("*")
          .eq("pet_id", FINNEGAN_ID)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Fetch medical data
        const { data: medical } = await supabase
          .from("medical")
          .select("*")
          .eq("pet_id", FINNEGAN_ID)
          .single();

        // Fetch pet photos
        const { data: photos } = await supabase
          .from("pet_photos")
          .select("*")
          .eq("pet_id", FINNEGAN_ID)
          .single();

        // Fetch contacts
        const { data: contacts } = await supabase
          .from("pet_contacts")
          .select("*")
          .eq("pet_id", FINNEGAN_ID);

        setData({
          ...pet,
          careInstructions,
          medical,
          photos,
          contacts,
        });
      } catch (error) {
        console.error("Error loading demo data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDemoData();
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

  const care = data.careInstructions || {};
  const meds = data.medical?.medications || [];
  const emergencyContacts = data.contacts?.filter((c: any) => c.contact_type === "emergency") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-cream">
      <MetaTags 
        title={`${data.name}'s Care & Handling Instructions - Live PetPort Demo`}
        description={`Experience a real PetPort Care & Handling page - ${data.name}'s complete care instructions, routines, and emergency protocols`}
        image="https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/og-images/resume-og-1mb.png"
        url="https://petport.app/demo/care"
      />

      {/* Live Demo Banner */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white py-3 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">✨ Demo – PetPort LiveLink</span>
          <a href="/#pricing">
            <Button 
              variant="outline" 
              size="sm"
              className="ml-4 bg-white text-brand-primary hover:bg-brand-cream border-white"
            >
              Get Started Today
            </Button>
          </a>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Pet Header */}
        <div className="mb-8 text-center">
          <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-white shadow-lg">
            <AvatarImage src={data.photos?.photo_url} alt={data.name} />
            <AvatarFallback>{data.name?.[0]}</AvatarFallback>
          </Avatar>
          <h1 className="text-4xl font-bold mb-2">{data.name}'s Care & Handling</h1>
          <p className="text-muted-foreground text-lg">
            {data.breed} • {data.age}
          </p>
        </div>

        {/* Feeding Schedule */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-brand-primary" />
              Feeding Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">
              {care.feeding_schedule || "No feeding schedule provided"}
            </p>
          </CardContent>
        </Card>

        {/* Daily Routine */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-primary" />
              Daily Routine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {care.morning_routine && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Morning Routine
                </h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {care.morning_routine}
                </p>
              </div>
            )}
            {care.evening_routine && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Evening Routine
                </h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {care.evening_routine}
                </p>
              </div>
            )}
            {!care.morning_routine && !care.evening_routine && (
              <p className="text-muted-foreground">No daily routine provided</p>
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        {meds.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-brand-primary" />
                Medications & Supplements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {meds.map((med: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Pill className="h-4 w-4 text-brand-secondary mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage}</p>
                      <p className="text-sm text-muted-foreground">{med.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Important Notes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-brand-primary" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {care.allergies && (
              <div>
                <Badge variant="destructive" className="mb-2">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Allergies
                </Badge>
                <p className="text-foreground whitespace-pre-wrap">{care.allergies}</p>
              </div>
            )}
            {care.behavioral_notes && (
              <div>
                <h4 className="font-semibold mb-2">Behavioral Notes</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {care.behavioral_notes}
                </p>
              </div>
            )}
            {care.favorite_activities && (
              <div>
                <h4 className="font-semibold mb-2">Favorite Activities</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {care.favorite_activities}
                </p>
              </div>
            )}
            {care.caretaker_notes && (
              <div>
                <h4 className="font-semibold mb-2">Caretaker Notes</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {care.caretaker_notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        {emergencyContacts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-brand-primary" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencyContacts.map((contact: any) => (
                  <div key={contact.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-4 w-4 text-brand-secondary" />
                    <div>
                      <p className="font-semibold">{contact.contact_name}</p>
                      <a 
                        href={`tel:${contact.contact_phone}`}
                        className="text-brand-primary hover:underline"
                      >
                        {contact.contact_phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg p-8 text-center text-white mt-8 mb-6">
          <h2 className="text-2xl font-bold mb-3">Ready to Create Care Instructions for Your Pet?</h2>
          <p className="mb-4 text-white/90">Join thousands of pet owners keeping caregivers informed</p>
          <a href="/#pricing">
            <Button 
              size="lg"
              className="bg-white text-brand-primary hover:bg-brand-cream"
            >
              Get Started Today
            </Button>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm pb-8">
          <div className="border-t border-sage-200 mb-6 max-w-md mx-auto" />
          <p>This is a live demo of {data.name}'s real PetPort care instructions.</p>
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
