
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Award } from "lucide-react";

interface SupportAnimalBannerProps {
  status: string | null;
}

export const SupportAnimalBanner = ({ status }: SupportAnimalBannerProps) => {
  if (!status) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Emotional Support Animal":
        return {
          bgColor: "from-red-600 to-red-800",
          textColor: "text-white",
          icon: Heart,
          borderColor: "border-red-600",
          abbreviation: "ESA"
        };
      case "Certified Therapy Dog":
        return {
          bgColor: "from-yellow-500 to-yellow-700",
          textColor: "text-navy-900",
          icon: Award,
          borderColor: "border-yellow-500",
          abbreviation: "THERAPY"
        };
      default:
        return {
          bgColor: "from-blue-600 to-blue-800",
          textColor: "text-white",
          icon: Shield,
          borderColor: "border-blue-600",
          abbreviation: "CERTIFIED"
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <div className={`bg-gradient-to-r ${config.bgColor} ${config.textColor} p-4 rounded-lg border-4 ${config.borderColor} shadow-xl mb-6 transform hover:scale-[1.02] transition-transform`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-wide">{status.toUpperCase()}</p>
            <p className="text-sm opacity-90">Official designation on file</p>
          </div>
        </div>
        <div className="text-right">
          <Badge 
            variant="outline" 
            className={`bg-white/20 border-white/40 ${config.textColor} font-bold text-sm px-3 py-1`}
          >
            {config.abbreviation}
          </Badge>
        </div>
      </div>
    </div>
  );
};
