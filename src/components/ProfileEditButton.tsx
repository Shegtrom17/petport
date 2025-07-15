
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
  
  console.log("ProfileEditButton - Current user:", user?.id);
  console.log("ProfileEditButton - Pet user_id:", userId);
  
  // Only show if the current user is the profile owner
  const isOwner = user?.id === userId;
  
  console.log("ProfileEditButton - isOwner:", isOwner);
  
  if (!isOwner) {
    console.log("ProfileEditButton - Not owner, hiding button");
    return null;
  }

  return (
    <div className="w-full max-w-md">
      <Button 
        onClick={onEdit}
        className="edit-button w-full bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 px-8 py-3 text-lg font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
        style={{
          opacity: 1,
          zIndex: 9999,
          position: 'relative',
          display: 'block',
          margin: '20px auto',
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px'
        }}
        size="lg"
      >
        <Edit className="w-6 h-6 mr-3" />
        Edit Profile
      </Button>
    </div>
  );
};
