import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";

export const PodcastBanner = () => {
  return (
    <div className="bg-gradient-to-r from-[#5691af]/10 to-[#5691af]/5 border-b border-[#5691af]/20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Headphones className="h-5 w-5 text-[#5691af]" />
          <span className="text-[#5691af] font-semibold">
            NEW: PetPort Podcast: Build a complete digital voice for your companion
          </span>
          <Link to="/podcast">
            <Button 
              variant="azure"
              size="sm"
            >
              Listen Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
