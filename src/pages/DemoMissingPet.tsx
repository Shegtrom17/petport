import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  Phone, 
  Heart,
  Clock,
  AlertCircle,
  Camera,
  Sparkles
} from "lucide-react";
import { MetaTags } from "@/components/MetaTags";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { FINN_LOST_PET_DATA } from "@/data/finnDemoData";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";

export default function DemoMissingPet() {
  const navigate = useNavigate();
  const data = FINN_LOST_PET_DATA;
  const lostData = data.lost_pet_data;
  
  const shareUrl = "https://petport.app/demo/missing-pet";
  const shareTitle = `LOST PET: ${data.name} - ${data.breed || data.species}`;
  const shareText = `Please help find ${data.name}! Last seen: ${lostData.last_seen_location}. ${lostData.reward_amount} REWARD!`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <MetaTags 
        title={`LOST PET: ${data.name} - Missing ${data.breed || data.species} Alert`}
        description={`URGENT: ${data.name} is missing! Last seen ${lostData.last_seen_location}. ${lostData.reward_amount} reward. Please help bring ${data.name} home safely.`}
        image="https://dxghbhujugsfmaecilrq.supabase.co/storage/v1/object/public/og-images/general-og.png"
        url={shareUrl}
        type="article"
      />

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary text-white py-3 px-4 text-center sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold">✨ Demo - This is NOT a real missing pet alert</span>
          <Button 
            onClick={() => navigate('/auth')}
            variant="outline" 
            size="sm"
            className="ml-4 bg-white text-brand-primary hover:bg-brand-cream border-white"
          >
            Create Your Pet's Emergency Page Free
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Urgent Header Alert */}
        <Alert className="mb-6 border-red-600 bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <AlertDescription className="text-red-900 font-semibold text-lg">
            🚨 MISSING PET ALERT - PLEASE HELP BRING {data.name.toUpperCase()} HOME SAFELY
          </AlertDescription>
        </Alert>

        {/* Medical Alert Banner */}
        {data.medical?.medical_alert && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="font-semibold">
              ⚠️ MEDICAL ALERT: {data.medical.medical_conditions}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Profile Card */}
        <Card className="mb-6 border-2 border-red-500 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
            <CardTitle className="text-3xl font-bold text-center">
              MISSING: {data.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Pet Photo */}
              <div className="flex-shrink-0">
                <img
                  src={data.photo_url}
                  alt={`Missing ${data.name}`}
                  className="w-64 h-64 object-cover rounded-lg shadow-lg border-4 border-red-500"
                />
                <p className="text-center mt-2 text-sm text-muted-foreground">
                  Last seen photo of {data.name}
                </p>
              </div>

              {/* Pet Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-brand-primary mb-2">Pet Details</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Species</p>
                      <p className="font-semibold capitalize">{data.species}</p>
                    </div>
                    {data.breed && (
                      <div>
                        <p className="text-sm text-muted-foreground">Breed</p>
                        <p className="font-semibold">{data.breed}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-semibold">{data.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-semibold">{data.weight} lbs</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sex</p>
                      <p className="font-semibold capitalize">{data.sex.replace('_', ' ')}</p>
                    </div>
                    {data.microchip_id && (
                      <div>
                        <p className="text-sm text-muted-foreground">Microchip</p>
                        <p className="font-semibold font-mono text-xs">{data.microchip_id}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reward */}
                {lostData.reward_amount && (
                  <Alert className="bg-green-50 border-green-600">
                    <Heart className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-900 font-bold text-xl">
                      {lostData.reward_amount} REWARD
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Seen Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <MapPin className="h-6 w-6" />
              Last Seen Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold text-lg">{lostData.last_seen_location}</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-semibold">{lostData.last_seen_date}</p>
                    <p className="text-sm">{lostData.last_seen_time}</p>
                  </div>
                </div>
              </div>
            </div>

            {lostData.distinctive_features && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Distinctive Features
                </h4>
                <p className="text-yellow-900">{lostData.distinctive_features}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        {data.pet_contacts && data.pet_contacts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-6 w-6 text-brand-primary" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.pet_contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-semibold text-brand-primary">{contact.contact_name}</p>
                    <Badge variant="outline" className="mt-1">
                      {contact.contact_type}
                    </Badge>
                  </div>
                  <a 
                    href={`tel:${contact.contact_phone}`}
                    className="inline-flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.contact_phone}
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Finder Instructions */}
        {lostData.finder_instructions && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-brand-primary" />
                If You Find {data.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-brand-primary-dark leading-relaxed mb-4">
                {lostData.finder_instructions}
              </p>
              {lostData.contact_priority && (
                <Alert>
                  <AlertDescription>
                    <strong>Contact Priority:</strong> {lostData.contact_priority}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* QR Code Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Share This Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-inner">
                <QRCode value={shareUrl} size={200} />
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Scan to view this missing pet alert on any device
            </p>
            <div className="flex justify-center">
              <SocialShareButtons 
                petName={data.name}
                petId={data.id}
                isMissingPet={true}
                context="missing"
                compact={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Gallery Preview */}
        {data.gallery_photos && data.gallery_photos.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-brand-primary" />
                Additional Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.gallery_photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.caption || `${data.name} photo`}
                      className="w-full h-40 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                    />
                    {photo.caption && (
                      <p className="text-xs text-center mt-1 text-muted-foreground">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg p-8 text-center text-white mb-6">
          <h2 className="text-2xl font-bold mb-3">Protect Your Pet with a PetPort Emergency Page</h2>
          <p className="mb-4 text-white/90">Be prepared with a shareable emergency profile and QR code</p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-white text-brand-primary hover:bg-brand-cream"
          >
            Create Free Emergency Page
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
            {" "}— Digital Emergency Profiles for Pets
          </p>
        </div>
      </div>
    </div>
  );
}
