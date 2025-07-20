import { Card, CardContent } from "@/components/ui/card";
import { Shield, Star } from "lucide-react";

interface CertificationBannerProps {
  certificationData?: {
    type?: string;
    status?: string;
    issuer?: string;
    certification_number?: string;
    issue_date?: string;
    expiry_date?: string;
  };
}

export const CertificationBanner = ({ certificationData }: CertificationBannerProps) => {
  // Don't show banner if no certification data
  if (!certificationData || !certificationData.type || !certificationData.status) {
    return null;
  }

  const isActive = certificationData.status === 'active';
  
  return (
    <Card className={`border-2 shadow-lg transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer ${
      isActive 
        ? 'border-purple-600 bg-gradient-to-r from-purple-600 to-indigo-700' 
        : 'border-amber-600 bg-gradient-to-r from-amber-600 to-orange-700'
    } text-white relative overflow-hidden`}>
      <div className="absolute inset-0 bg-black/10"></div>
      <CardContent className="p-3 relative">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="w-6 h-6 text-white" />
          <div className="text-center">
            <div className="flex items-center space-x-2 justify-center">
              <Star className="w-4 h-4 text-yellow-300" />
              <h3 className="text-base font-bold tracking-wide">
                {certificationData.type.toUpperCase()} CERTIFIED
              </h3>
              <Star className="w-4 h-4 text-yellow-300" />
            </div>
            <p className="text-xs text-purple-100 mt-1">
              {certificationData.issuer} • {certificationData.status.toUpperCase()}
            </p>
          </div>
          <Shield className="w-6 h-6 text-white" />
        </div>
      </CardContent>
    </Card>
  );
};