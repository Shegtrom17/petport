
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Heart, Shield } from "lucide-react";

interface BadgesSectionProps {
  badges: string[];
}

export const BadgesSection = ({ badges }: BadgesSectionProps) => {
  const badgeCategories = [
    {
      title: "Behavior Badges",
      description: "Verified behavioral achievements",
      badges: badges.filter(badge => 
        ["Well-Behaved", "Good with Kids", "House Trained", "Friendly with Dogs"].includes(badge)
      ),
      icon: Heart,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Training Badges",
      description: "Training and certification achievements",
      badges: badges.filter(badge => 
        ["Therapy Certified", "Basic Obedience", "Advanced Training"].includes(badge)
      ),
      icon: Award,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Special Recognition",
      description: "Unique achievements and recognitions",
      badges: badges.filter(badge => 
        ["Hero Pet", "Community Favorite", "Show Winner"].includes(badge)
      ),
      icon: Star,
      color: "from-yellow-500 to-orange-600"
    }
  ];

  const availableBadges = [
    "Agility Trained", "Therapy Ready", "Good with Cats", "Travel Ready", 
    "Swim Certified", "Guard Trained", "Show Quality", "Community Helper"
  ];

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      {badgeCategories.map((category, index) => (
        category.badges.length > 0 && (
          <Card key={index} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                  <category.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span>{category.title}</span>
                  <p className="text-sm font-normal text-gray-600">{category.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {category.badges.map((badge, badgeIndex) => (
                  <div
                    key={badgeIndex}
                    className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center mb-2`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`bg-gradient-to-r ${category.color} text-white text-xs`}
                    >
                      {badge}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      ))}

      {/* Available Badges */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-gray-500" />
            <span>Available Badges</span>
            <Badge variant="outline" className="ml-2">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Work towards earning these badges through verified activities and achievements:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableBadges.map((badge, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 opacity-60"
              >
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-gray-500" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {badge}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
