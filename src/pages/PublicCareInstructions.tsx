import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchPetDetails } from "@/services/petService";
import { fetchCareInstructions } from "@/services/careInstructionsService";
import { Heart, Clock, Pill, Coffee, Moon, AlertTriangle } from "lucide-react";

const PublicCareInstructions = () => {
  const { petId } = useParams<{ petId: string }>();
  const [petData, setPetData] = useState<any>(null);
  const [careData, setCareData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!petId) {
        setError("Pet ID not provided");
        setIsLoading(false);
        return;
      }

      try {
        const [petDetails, careInstructions] = await Promise.all([
          fetchPetDetails(petId),
          fetchCareInstructions(petId)
        ]);
        
        if (petDetails) {
          setPetData(petDetails);
          setCareData(careInstructions);
        } else {
          setError("Pet profile not found");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load pet care instructions");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [petId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p>Loading care instructions...</p>
        </div>
      </div>
    );
  }

  if (error || !petData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Care Instructions Not Found</h1>
          <p className="text-gray-600">{error || "The requested care instructions could not be found."}</p>
        </div>
      </div>
    );
  }

  const isHorse = petData.species?.toLowerCase() === 'horse';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-green-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌿</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Care Instructions for {petData.name}</h1>
              <p className="text-gray-600">Daily care guide for pet sitters and caregivers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Pet Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {petData.photoUrl && (
                <div className="flex-shrink-0">
                  <img 
                    src={petData.photoUrl} 
                    alt={petData.name}
                    className="w-48 h-48 object-cover rounded-full border-4 border-sage-200"
                  />
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{petData.name}</h1>
                <p className="text-xl text-gray-600 mb-4">
                  {petData.species && petData.species.charAt(0).toUpperCase() + petData.species.slice(1)}
                  {petData.breed && ` • ${petData.breed}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="border-0 shadow-lg bg-red-50 border-l-4 border-red-500 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <span>Emergency Contacts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {petData.emergencyContact && (
              <p><strong>Primary Emergency:</strong> {petData.emergencyContact}</p>
            )}
            {petData.vetContact && (
              <p><strong>Veterinarian:</strong> {petData.vetContact}</p>
            )}
          </CardContent>
        </Card>

        {/* Feeding Schedule */}
        <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coffee className="w-5 h-5 text-orange-600" />
              <span>{isHorse ? 'Feeding & Turnout Schedule' : 'Feeding Schedule'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {careData?.feeding_schedule ? (
              <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-medium text-orange-700 mb-2">Custom Schedule</h4>
                <p>{careData.feeding_schedule}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">Standard schedule:</p>
                {isHorse ? (
                  <>
                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <Badge variant="outline" className="text-orange-700 border-orange-300 mb-2">6:00 AM</Badge>
                      <p>Morning hay - 2 flakes timothy • Check water buckets</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <Badge variant="outline" className="text-orange-700 border-orange-300 mb-2">12:00 PM</Badge>
                      <p>Grain feed - 2 lbs sweet feed • Add supplements</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <Badge variant="outline" className="text-orange-700 border-orange-300 mb-2">7:00 AM</Badge>
                      <p>Morning feed - 2 cups dry food + supplements</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <Badge variant="outline" className="text-orange-700 border-orange-300 mb-2">6:00 PM</Badge>
                      <p>Evening feed - 2 cups dry food</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Routines */}
        <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Moon className="w-5 h-5 text-purple-600" />
              <span>Daily Routine & Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Morning Routine</h4>
                <p className="text-sm text-purple-800">
                  {careData?.morning_routine || (isHorse 
                    ? "Check water buckets and hay, quick health check, feeding time"
                    : "Potty break immediately, short walk before breakfast, feeding time"
                  )}
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-2">Evening Routine</h4>
                <p className="text-sm text-indigo-800">
                  {careData?.evening_routine || (isHorse
                    ? "Turn out or bring in from pasture, final hay feeding"
                    : "Play time after dinner, final potty break at 10 PM, bedtime routine"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-0 shadow-lg bg-passport-section-bg backdrop-blur-sm border-l-4 border-amber-500 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              <span>Important Care Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <h4 className="font-medium text-red-900 mb-1">Allergies & Sensitivities</h4>
              <p className="text-sm text-red-800">
                {careData?.allergies || (isHorse 
                  ? "Sensitive to alfalfa - stick to timothy hay only"
                  : "Sensitive to chicken - avoid poultry-based treats"
                )}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-1">Behavioral Notes</h4>
              <p className="text-sm text-blue-800">
                {careData?.behavioral_notes || (isHorse
                  ? "Generally calm but can be anxious during storms"
                  : "Friendly but needs slow introductions to new pets"
                )}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <h4 className="font-medium text-green-900 mb-1">Favorite Activities</h4>
              <p className="text-sm text-green-800">
                {careData?.favorite_activities || (isHorse
                  ? "Enjoys trail rides and grooming sessions"
                  : "Loves fetch, swimming, and puzzle toys"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Care instructions for {petData.name} • Generated by PetPort</p>
          <p className="mt-2">📱 For real-time updates, visit the full PetPort profile</p>
        </div>
      </div>
    </div>
  );
};

export default PublicCareInstructions;