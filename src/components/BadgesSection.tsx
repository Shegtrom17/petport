
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Shield, Award, Star, Users, Edit } from "lucide-react";
import { BadgeEditForm } from "@/components/BadgeEditForm";

interface BadgesSectionProps {
  badges: string[];
  petData: {
    id: string;
    name: string;
    badges?: string[];
    supportAnimalStatus?: string;
    species?: string;
  };
  onUpdate?: () => void;
}

export const BadgesSection = ({ badges, petData, onUpdate }: BadgesSectionProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Badges & Certifications</h2>
              <p className="text-blue-100">Earned achievements and qualifications</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setIsEditModalOpen(true)} 
                variant="secondary" 
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Badges
              </Button>
            </div>
          </div>

          {/* Badge Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-yellow-400">{badges.length}</div>
              <div className="text-blue-100">Total Badges</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-3xl font-bold text-green-400">
                {Math.round((badges.length / 16) * 100)}%
              </div>
              <div className="text-blue-100">Completion Rate</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <Award className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
              <div className="text-blue-100">
                {badges.length >= 10 ? "Expert" : badges.length >= 5 ? "Advanced" : "Beginner"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Badges & Certifications</DialogTitle>
          </DialogHeader>
          <BadgeEditForm
            petData={petData}
            onSave={handleEditSave}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Earned Badges */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span>Earned Badges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge, index) => {
                const getIcon = (badgeName: string) => {
                  if (badgeName.toLowerCase().includes('therapy') || badgeName.toLowerCase().includes('certified')) return '🏆';
                  if (badgeName.toLowerCase().includes('kids') || badgeName.toLowerCase().includes('child')) return '🐾';
                  if (badgeName.toLowerCase().includes('trained') || badgeName.toLowerCase().includes('behaved')) return '🦴';
                  return '🌍';
                };

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 transform hover:scale-105 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-2 text-2xl">
                      {getIcon(badge)}
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold border-2 border-yellow-400"
                    >
                      {badge}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Badges Yet</h3>
              <p className="text-gray-500 mb-4">
                Add badges to showcase {petData.name}'s achievements and qualifications
              </p>
              <Button 
                onClick={() => setIsEditModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add First Badge
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge Progress */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span>Badge Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{badges.length}/16 badges</span>
              </div>
              <Progress value={(badges.length / 16) * 100} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Common Badges</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>House Trained</span>
                    <span className={badges.includes("House Trained") ? "text-green-600" : "text-gray-400"}>
                      {badges.includes("House Trained") ? "✓" : "○"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Well-Behaved</span>
                    <span className={badges.includes("Well-Behaved") ? "text-green-600" : "text-gray-400"}>
                      {badges.includes("Well-Behaved") ? "✓" : "○"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Good with Kids</span>
                    <span className={badges.includes("Good with Kids") ? "text-green-600" : "text-gray-400"}>
                      {badges.includes("Good with Kids") ? "✓" : "○"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Advanced Badges</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Therapy Certified</span>
                    <span className={badges.includes("Therapy Certified") ? "text-green-600" : "text-gray-400"}>
                      {badges.includes("Therapy Certified") ? "✓" : "○"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Animal</span>
                    <span className={badges.includes("Service Animal") ? "text-green-600" : "text-gray-400"}>
                      {badges.includes("Service Animal") ? "✓" : "○"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Obedience Trained</span>
                    <span className={badges.includes("Obedience Trained") ? "text-green-600" : "text-gray-400"}>
                      {badges.includes("Obedience Trained") ? "✓" : "○"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
