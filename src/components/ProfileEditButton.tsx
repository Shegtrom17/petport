
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProfileEditButtonProps {
  userId?: string;
  onEdit?: () => void;
}

export const ProfileEditButton = ({ userId, onEdit }: ProfileEditButtonProps) => {
  const { user } = useAuth();
  
  // Only show if the current user is the profile owner
  const isOwner = user?.id === userId;
  
  if (!isOwner) return null;

  return (
    <Button 
      onClick={onEdit}
      className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 px-6 py-2 text-base font-medium shadow-lg"
      size="lg"
    >
      <User className="w-5 h-5 mr-2" />
      Edit Profile
    </Button>
  );
};
