
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
        className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white border border-white/20 px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
        size="lg"
      >
        <span>Edit Profile</span>
      </Button>
    </div>
  );
};
