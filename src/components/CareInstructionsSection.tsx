
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Pill, Coffee, Moon, AlertTriangle, Edit } from "lucide-react";

interface CareInstructionsSectionProps {
  petData: {
    name: string;
    species?: string;
    medications: string[];
  };
}

export const CareInstructionsSection = ({ petData }: CareInstructionsSectionProps) => {
  const isHorse = petData.species?.toLowerCase() === 'horse';
  
  const feedingSchedule = [
    { time: "7:00 AM", meal: "Morning feed - 2 cups dry food + supplements", notes: "Mix with warm water if preferred" },
    { time: "12:00 PM", meal: "Light snack - Training treats only", notes: "If active/training day" },
    { time: "6:00 PM", meal: "Evening feed - 2 cups dry food", notes: "Fresh water always available" },
  ];

  const horseSchedule = [
    { time: "6:00 AM", meal: "Morning hay - 2 flakes timothy", notes: "Check water buckets" },
    { time: "12:00 PM", meal: "Grain feed - 2 lbs sweet feed", notes: "Add supplements" },
    { time: "6:00 PM", meal: "Evening hay - 2 flakes", notes: "Turn out or bring in from pasture" },
  ];

  const currentSchedule = isHorse ? horseSchedule : feedingSchedule;

  return (
    <div className="space-y-6">
      {/* Documentation Note */}
      <Card className="border-0 shadow-lg bg-blue-50 border-l-4 border-blue-500">
        <CardContent className="p-4">
          <p className="text-blue-800 text-sm font-medium">
            📄 For supporting documentation, please see the Documents page.
          </p>
        </CardContent>
      </Card>

      {/* Care Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Care Instructions for {petData.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-100">
            Complete care guide for pet sitters, boarding facilities, and emergency caregivers.
            All instructions are current as of the last update.
          </p>
          <Button variant="secondary" className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/30">
            <Edit className="w-4 h-4 mr-2" />
            Edit Instructions
          </Button>
        </CardContent>
      </Card>

      {/* Feeding Schedule */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 text-orange-600" />
            <span>{isHorse ? 'Feeding & Turnout Schedule' : 'Feeding Schedule'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentSchedule.map((feeding, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center space-x-2 min-w-0">
                  <Clock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <Badge variant="outline" className="text-orange-700 border-orange-300">
                    {feeding.time}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{feeding.meal}</p>
                  <p className="text-sm text-gray-600 mt-1">{feeding.notes}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medications & Health */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-red-600" />
            <span>Medications & Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {petData.medications.length > 0 ? (
            petData.medications.map((medication, index) => (
              <div key={index} className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center space-x-2 mb-2">
                  <Pill className="w-4 h-4 text-red-600" />
                  <Badge variant="destructive">MEDICATION</Badge>
                </div>
                <p className="font-medium">{medication}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Administer as prescribed. Contact vet if missed doses or reactions occur.
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 italic">No current medications</p>
          )}
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Health Monitoring</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Monitor appetite and water intake daily</li>
              <li>• Watch for any behavioral changes</li>
              <li>• Check for signs of distress or discomfort</li>
              {isHorse && <li>• Check hooves and legs for heat/swelling</li>}
              <li>• Contact vet immediately if concerns arise</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Daily Routine */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Moon className="w-5 h-5 text-purple-600" />
            <span>Daily Routine & Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Morning Routine</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Wake up around 7:00 AM</li>
                <li>• {isHorse ? 'Check water buckets and hay' : 'Potty break immediately'}</li>
                <li>• {isHorse ? 'Quick health check' : 'Short walk before breakfast'}</li>
                <li>• Feeding time</li>
              </ul>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Evening Routine</h4>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Dinner around 6:00 PM</li>
                <li>• {isHorse ? 'Turn out or bring in from pasture' : 'Play time after dinner'}</li>
                <li>• {isHorse ? 'Final hay feeding' : 'Final potty break at 10 PM'}</li>
                <li>• {!isHorse && 'Bedtime routine - quiet time'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency & Important Notes */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm border-l-4 border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <span>Emergency & Important Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-red-50 rounded border border-red-200">
            <h4 className="font-medium text-red-900 mb-1">Allergies & Sensitivities</h4>
            <p className="text-sm text-red-800">
              {isHorse 
                ? "Sensitive to alfalfa - stick to timothy hay only. No moldy or dusty feed."
                : "Sensitive to chicken - avoid all poultry-based treats and foods."
              }
            </p>
          </div>
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-900 mb-1">Behavioral Notes</h4>
            <p className="text-sm text-yellow-800">
              {isHorse
                ? "Generally calm but can be anxious during storms. Provide extra hay for comfort."
                : "Friendly with other dogs but needs slow introductions. Afraid of thunderstorms - provide comfort."
              }
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <h4 className="font-medium text-green-900 mb-1">Favorite Activities</h4>
            <p className="text-sm text-green-800">
              {isHorse
                ? "Enjoys trail rides and groundwork. Loves grooming sessions."
                : "Loves swimming, fetch, and puzzle toys. Great with children."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
