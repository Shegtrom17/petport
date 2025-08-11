import { useState } from "react";
import { NativeModal } from "@/components/NativeModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Syringe, MapPin, Building, Calendar, Shield, AlertTriangle, Dog, Cat, Heart } from "lucide-react";

interface VaccinationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VaccinationGuide = ({ isOpen, onClose }: VaccinationGuideProps) => {
  const [selectedTab, setSelectedTab] = useState("travel");
  const [selectedSpecies, setSelectedSpecies] = useState("dogs");

  // Species data structure
  const speciesData = {
    dogs: {
      name: "Dogs",
      icon: Dog,
      coreVaccines: [
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
      ],
      additionalVaccines: [
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
      ],
      travelRequirements: {
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
      },
      boardingRequirements: [
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
      ],
      ageSchedule: [
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
      ]
    },
    cats: {
      name: "Cats",
      icon: Cat,
      coreVaccines: [
        {
          name: "Rabies",
          required: "Yes",
          frequency: "Annually or every 3 years",
          notes: "Required for travel and many boarding facilities",
          critical: true
        },
        {
          name: "FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)",
          required: "Yes",
          frequency: "Annually",
          notes: "Core vaccine series, essential for all cats",
          critical: true
        }
      ],
      additionalVaccines: [
        {
          name: "FeLV (Feline Leukemia Virus)",
          required: "Recommended",
          frequency: "Annually",
          notes: "Essential for outdoor cats and multi-cat households"
        },
        {
          name: "FIV (Feline Immunodeficiency Virus)",
          required: "Optional",
          frequency: "Annually",
          notes: "For high-risk cats (outdoor, fighting)"
        },
        {
          name: "Chlamydophila felis",
          required: "Optional",
          frequency: "Annually",
          notes: "For cats in multi-cat environments"
        },
        {
          name: "Bordetella bronchiseptica",
          required: "Optional",
          frequency: "Annually",
          notes: "For cats in boarding or group settings"
        }
      ],
      travelRequirements: {
        domestic: {
          title: "Domestic Travel (Within Country)",
          requirements: [
            "Current rabies vaccination (required)",
            "FVRCP vaccination series (recommended)",
            "Health certificate from veterinarian (some states/regions)",
            "FeLV testing (some facilities require)"
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
            "FVRCP vaccination series",
            "Airline-approved carrier",
            "Acclimation certificate for extreme temperatures"
          ]
        }
      },
      boardingRequirements: [
        {
          category: "Required Vaccines",
          vaccines: ["Rabies", "FVRCP"],
          frequency: "Must be current"
        },
        {
          category: "Recommended Vaccines",
          vaccines: ["FeLV", "Bordetella"],
          frequency: "Based on facility requirements"
        },
        {
          category: "Additional Requirements",
          vaccines: ["FeLV testing", "Flea/tick prevention", "Spay/neuter"],
          frequency: "Varies by facility"
        }
      ],
      ageSchedule: [
        {
          age: "6-8 weeks",
          vaccines: ["First FVRCP"]
        },
        {
          age: "10-12 weeks",
          vaccines: ["Second FVRCP", "FeLV (if outdoor/multi-cat)"]
        },
        {
          age: "14-16 weeks",
          vaccines: ["Third FVRCP", "Rabies", "FeLV booster (if applicable)"]
        },
        {
          age: "Annual",
          vaccines: ["FVRCP booster", "Rabies (1 or 3 year)", "FeLV (if applicable)"]
        }
      ]
    },
    horses: {
      name: "Horses",
      icon: Heart,
      coreVaccines: [
        {
          name: "Eastern/Western Equine Encephalomyelitis",
          required: "Yes",
          frequency: "Annually",
          notes: "Core vaccine for all horses",
          critical: true
        },
        {
          name: "Tetanus",
          required: "Yes",
          frequency: "Annually",
          notes: "Essential due to wound susceptibility",
          critical: true
        },
        {
          name: "West Nile Virus",
          required: "Yes",
          frequency: "Annually",
          notes: "Core vaccine in endemic areas",
          critical: true
        },
        {
          name: "Rabies",
          required: "Yes",
          frequency: "Annually",
          notes: "Required for travel and competition",
          critical: true
        }
      ],
      additionalVaccines: [
        {
          name: "Influenza",
          required: "Recommended",
          frequency: "Every 6 months",
          notes: "Essential for horses in training or competition"
        },
        {
          name: "Rhinopneumonitis (EHV-1/EHV-4)",
          required: "Recommended",
          frequency: "Every 6 months",
          notes: "Important for pregnant mares and performance horses"
        },
        {
          name: "Strangles",
          required: "Risk-based",
          frequency: "Annually",
          notes: "For horses with exposure risk"
        },
        {
          name: "Potomac Horse Fever",
          required: "Regional",
          frequency: "Annually",
          notes: "Endemic areas only"
        },
        {
          name: "Botulism",
          required: "Risk-based",
          frequency: "Annually",
          notes: "For horses fed round bales or in endemic areas"
        }
      ],
      travelRequirements: {
        domestic: {
          title: "Interstate Travel",
          requirements: [
            "Negative Coggins test (within 12 months)",
            "Health certificate (within 30 days)",
            "Current vaccination records",
            "State entry permit (some states)",
            "Brand inspection (some states)"
          ]
        },
        international: {
          title: "International Travel",
          requirements: [
            "USDA-accredited veterinarian health certificate",
            "Negative Coggins test",
            "Complete vaccination records",
            "Quarantine requirements (varies by country)",
            "Import/export permits",
            "Blood testing for specific diseases"
          ]
        },
        competition: {
          title: "Competition/Show Travel",
          requirements: [
            "Negative Coggins test (within 12 months)",
            "Health certificate (within 30 days)",
            "Current influenza and rhinopneumonitis vaccines",
            "Association-specific requirements",
            "Strangles vaccination (some venues)"
          ]
        }
      },
      boardingRequirements: [
        {
          category: "Required Documents",
          vaccines: ["Negative Coggins test", "Health certificate", "Vaccination records"],
          frequency: "Must be current"
        },
        {
          category: "Required Vaccines",
          vaccines: ["Core vaccines", "Influenza", "Rhinopneumonitis"],
          frequency: "Must be current"
        },
        {
          category: "Additional Requirements",
          vaccines: ["Deworming records", "Strangles vaccination", "Insurance documentation"],
          frequency: "Varies by facility"
        }
      ],
      ageSchedule: [
        {
          age: "4-6 months (Foals)",
          vaccines: ["First core vaccine series", "Rhinopneumonitis"]
        },
        {
          age: "5-7 months",
          vaccines: ["Second core vaccine series", "Influenza (if applicable)"]
        },
        {
          age: "6-8 months",
          vaccines: ["Third core vaccine series", "Complete initial series"]
        },
        {
          age: "Annual/Semi-annual",
          vaccines: ["Core vaccine boosters", "Influenza/Rhino (every 6 months)", "Risk-based vaccines"]
        }
      ]
    }
  };

  // Get current species data
  const currentSpecies = speciesData[selectedSpecies as keyof typeof speciesData];

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

        {/* Species Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Species</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(speciesData).map(([key, species]) => {
                const IconComponent = species.icon;
                return (
                  <Button
                    key={key}
                    variant={selectedSpecies === key ? "default" : "outline"}
                    onClick={() => setSelectedSpecies(key)}
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    {species.name}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="travel">Travel</TabsTrigger>
            <TabsTrigger value="daycare">Boarding</TabsTrigger>
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
                  {Object.entries(currentSpecies.travelRequirements).map(([key, requirement]) => (
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
                  {currentSpecies.coreVaccines.map((vaccine, index) => (
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
                  {currentSpecies.additionalVaccines.map((vaccine, index) => (
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
                {currentSpecies.boardingRequirements.map((category, index) => (
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
                {currentSpecies.ageSchedule.map((schedule, index) => (
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