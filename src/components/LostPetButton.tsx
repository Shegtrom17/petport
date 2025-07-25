import { Button } from "@/components/ui/button";
import { Search, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LostPetButtonProps {
  petId?: string;
  isMissing?: boolean;
  className?: string;
}

export const LostPetButton = ({ petId, isMissing = false, className = "" }: LostPetButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (petId) {
      navigate(`/lost-pet/${petId}`);
    } else {
      navigate('/lost-pet');
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`bg-gradient-to-r ${
        isMissing 
          ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-2 border-red-500' 
          : 'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
      } text-white shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      {isMissing ? (
        <>
          <AlertTriangle className="w-4 h-4 mr-2 animate-pulse" />
          MISSING ALERT
        </>
      ) : (
        <>
          <Search className="w-4 h-4 mr-2" />
          Lost Pet Alert
        </>
      )}
    </Button>
  );
};