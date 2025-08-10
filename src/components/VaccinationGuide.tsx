import { useState } from "react";
import { NativeModal } from "@/components/NativeModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Syringe, MapPin, Building, Calendar, Shield, AlertTriangle } from "lucide-react";

interface VaccinationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaccinationGuide = ({ isOpen, onClose }: VaccinationGuideProps) => {
  const [selectedTab, setSelectedTab] = useState("travel");

  const coreVaccines = [
    {
      name: "Rabies",
      required: "Yes",
      frequency: "Annually or every 3 years",
      notes: "Required for ALL travel and most daycare facilities",
      critical: true
    },
    {
      name: "DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)",
      required: "Yes",
      frequency: "Annually",
      notes: "Core vaccine series, essential for public spaces",
      critical: true
    }
  ];

  const additionalVaccines = [
    {
      name: "Bordetella (Kennel Cough)",
      required: "Usually",
      frequency: "Every 6-12 months",
      notes: "Required by most daycare and boarding facilities"
    },
    {
      name: "Lyme Disease",
      required: "Regional",
      frequency: "Annually",
      notes: "Recommended in tick-endemic areas"
    },
    {
      name: "Canine Influenza",
      required: "Optional",
      frequency: "Annually",
      notes: "Recommended for dogs in group settings"
    }
  ];

  const travelRequirements = {
    domestic: {
      title: "Domestic Travel (Within Country)",
      requirements: [
        "Current rabies vaccination (required)",
        "DHPP vaccination series (recommended)",
        "Health certificate from veterinarian (some states/regions)",
        "Bordetella if staying in kennels or group settings"
      ]
    },
    international: {
      title: "International Travel",
      requirements: [
        "Rabies vaccination (21+ days old, valid for duration)",
        "Health certificate from USDA-accredited veterinarian",
        "USDA endorsement of health certificate",
        "Country-specific requirements (varies by destination)",
        "Microchip identification (ISO standard)",
        "Possible quarantine requirements"
      ]
    },
    airlines: {
      title: "Airline Travel",
      requirements: [
        "Health certificate (within 10 days of travel)",
        "Current rabies vaccination",
        "DHPP vaccination series",
        "Bordetella vaccination (recommended)",
        "Airline-approved carrier",
        "Acclimation certificate for extreme temperatures"
      ]
    }
  };

  const daycareRequirements = [
    {
      category: "Required Vaccines",
      vaccines: ["Rabies", "DHPP", "Bordetella"],
      frequency: "Must be current"
    },
    {
      category: "Recommended Vaccines",
      vaccines: ["Canine Influenza", "Lyme Disease"],
      frequency: "Based on regional risk"
    },
    {
      category: "Additional Requirements",
      vaccines: ["Fecal exam", "Flea/tick prevention", "Spay/neuter"],
      frequency: "Varies by facility"
    }
  ];

  const ageSchedule = [
    {
      age: "6-8 weeks",
      vaccines: ["First DHPP", "Bordetella (intranasal)"]
    },
    {
      age: "10-12 weeks",
      vaccines: ["Second DHPP", "Lyme Disease (if applicable)"]
    },
    {
      age: "14-16 weeks",
      vaccines: ["Third DHPP", "Rabies", "Canine Influenza (if applicable)"]
    },
    {
      age: "Annual",
      vaccines: ["DHPP booster", "Rabies (1 or 3 year)", "Bordetella", "Other boosters as needed"]
    }
  ];

  return (
    <NativeModal isOpen={isOpen} onClose={onClose} title="Travel & Vaccination Guide">
      <div className="space-y-6">
        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> This guide provides general information. Always consult with your veterinarian 
                  and check specific requirements for your destination, airline, or facility.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="travel">Travel</TabsTrigger>
            <TabsTrigger value="daycare">Daycare</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="travel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Travel Requirements by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(travelRequirements).map(([key, requirement]) => (
                    <AccordionItem key={key} value={key}>
                      <AccordionTrigger className="text-left">
                        {requirement.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {requirement.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Core vs Additional Vaccines */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Core Vaccines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coreVaccines.map((vaccine, index) => (
                    <div key={index} className="p-3 rounded border">
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="text-sm">{vaccine.name}</strong>
                        {vaccine.critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        <strong>Frequency:</strong> {vaccine.frequency}
                      </p>
                      <p className="text-xs text-muted-foreground">{vaccine.notes}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Vaccines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {additionalVaccines.map((vaccine, index) => (
                    <div key={index} className="p-3 rounded border">
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="text-sm">{vaccine.name}</strong>
                        <Badge variant="outline" className="text-xs">{vaccine.required}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        <strong>Frequency:</strong> {vaccine.frequency}
                      </p>
                      <p className="text-xs text-muted-foreground">{vaccine.notes}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="daycare" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Daycare & Boarding Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {daycareRequirements.map((category, index) => (
                  <div key={index} className="p-4 rounded border">
                    <h4 className="font-medium mb-2">{category.category}</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {category.vaccines.map((vaccine, vIndex) => (
                        <Badge key={vIndex} variant="secondary">{vaccine}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{category.frequency}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 text-blue-900">Facility-Specific Notes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Requirements may vary between facilities</li>
                  <li>• Some facilities require vaccines 2+ weeks before admission</li>
                  <li>• Always call ahead to confirm current requirements</li>
                  <li>• Bring vaccination records on the first visit</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Vaccination Schedule by Age
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ageSchedule.map((schedule, index) => (
                  <div key={index} className="p-4 rounded border">
                    <h4 className="font-medium mb-2 text-primary">{schedule.age}</h4>
                    <div className="flex flex-wrap gap-2">
                      {schedule.vaccines.map((vaccine, vIndex) => (
                        <Badge key={vIndex} variant="outline">{vaccine}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2 text-green-900">Planning Tips</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Schedule vaccines 2-4 weeks before travel</li>
                  <li>• Keep digital copies of vaccination records</li>
                  <li>• Set calendar reminders for annual boosters</li>
                  <li>• Research destination requirements early</li>
                  <li>• Consider travel insurance for pets</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </NativeModal>
  );
};

export const VaccinationGuideButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Syringe className="w-4 h-4" />
        Vaccination Guide
      </Button>
      <VaccinationGuide isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};