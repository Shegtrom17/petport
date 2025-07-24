
import { Button } from "@/components/ui/button";
import { LogIn, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthenticationPromptProps {
  isSignedIn: boolean;
  hasPets: boolean;
}

export const AuthenticationPrompt = ({ isSignedIn, hasPets }: AuthenticationPromptProps) => {
  const navigate = useNavigate();

  if (isSignedIn && hasPets) return null;

  return (
    <div className="text-center py-12 sm:py-20">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/70 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        {!isSignedIn ? (
          <LogIn className="h-8 w-8 sm:h-10 sm:w-10 text-navy-800/50" />
        ) : (
          <PlusCircle className="h-8 w-8 sm:h-10 sm:w-10 text-navy-800/50" />
        )}
      </div>
      
      {!isSignedIn ? (
        <>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-800 mb-2 sm:mb-3">Welcome to PetPort</h2>
          <p className="text-navy-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">Sign in or create an account to manage your pet's digital passport!</p>
          <Button 
            className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            onClick={() => navigate('/auth')}
          >
            <LogIn className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Get Started
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-xl sm:text-2xl font-bold text-navy-800 mb-2 sm:mb-3">No pets found</h2>
          <p className="text-navy-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">You haven't added any pets yet. Create your first PetPort!</p>
          <Button 
            className="bg-gradient-to-r from-navy-900 to-navy-800 hover:from-navy-800 hover:to-navy-700 text-gold-500 border border-gold-500/30 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
            onClick={() => navigate('/add-pet')}
          >
            <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Add Your First Pet
          </Button>
        </>
      )}
    </div>
  );
};
