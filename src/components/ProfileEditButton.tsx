
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProfileEditButtonProps {
  userId?: string;
  onEdit?: () => void;
}

export const ProfileEditButton = ({ userId, onEdit }: ProfileEditButtonProps) => {
  const { user } = useAuth();
  
  // Only show if the current user is the profile owner
  const isOwner = user?.id === userId;
  
  if (!isOwner) {
    return null;
  }

  const handleClick = () => {
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <div className="w-full max-w-md">
      <Button 
        onClick={handleClick}
        className="w-full bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
        size="lg"
      >
        <span>Edit Profile</span>
      </Button>
    </div>
  );
};
