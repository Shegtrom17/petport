import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Heart, Sparkles, Star, TreePine, Flame } from "lucide-react";

export const HolidayGiftSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-rose-50 via-red-50 to-amber-50 py-20 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-rose-300 opacity-20">
        <Sparkles className="w-16 h-16" />
      </div>
      <div className="absolute bottom-10 right-10 text-amber-300 opacity-20">
        <Star className="w-20 h-20" />
      </div>
      <div className="absolute top-1/2 left-1/4 text-red-200 opacity-10">
        <Gift className="w-24 h-24" />
      </div>
      {/* Christmas Tree */}
      <div className="absolute top-20 right-20 text-green-400 opacity-25">
        <TreePine className="w-32 h-32" />
      </div>
      {/* Hanukkah Menorah */}
      <div className="absolute bottom-20 left-20 text-blue-400 opacity-25">
        <div className="flex gap-1">
          <Flame className="w-6 h-8" />
          <Flame className="w-6 h-8" />
          <Flame className="w-6 h-8" />
          <Flame className="w-8 h-10" />
          <Flame className="w-6 h-8" />
          <Flame className="w-6 h-8" />
          <Flame className="w-6 h-8" />
          <Flame className="w-6 h-8" />
          <Flame className="w-6 h-8" />
        </div>
      </div>
      {/* Extra festive elements */}
      <div className="absolute top-1/3 right-1/3 text-emerald-300 opacity-15">
        <TreePine className="w-16 h-16" />
      </div>
      <div className="absolute bottom-1/3 right-1/4 text-amber-400 opacity-20 animate-pulse">
        <Star className="w-12 h-12" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          {/* Holiday Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-rose-300 rounded-full px-6 py-2 mb-6 shadow-lg">
            <Gift className="h-5 w-5 text-rose-600" />
            <span className="text-rose-700 font-bold text-sm uppercase tracking-wide">
              Perfect Holiday Gift
            </span>
            <Gift className="h-5 w-5 text-rose-600" />
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-primary mb-6 leading-tight">
            Give the Gift of Pet Safety & Memories
          </h2>
          
          <p className="text-xl text-brand-primary-dark max-w-3xl mx-auto mb-8 leading-relaxed">
            The perfect gift for dog and cat owners who have everything. 12 months of digital pet protection, lost pet recovery tools, medical record organization, and lifetime memory preservation.
          </p>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-rose-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-brand-primary mb-2">Lost Pet Recovery</h3>
              <p className="text-sm text-brand-primary-dark">One-tap flyers & LiveLinks</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-brand-primary mb-2">Digital Records</h3>
              <p className="text-sm text-brand-primary-dark">Medical & travel docs</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-rose-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-brand-primary mb-2">Housing Resume</h3>
              <p className="text-sm text-brand-primary-dark">Pet screening builder</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-amber-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-brand-primary mb-2">Memory Gallery</h3>
              <p className="text-sm text-brand-primary-dark">Unlimited photo storage</p>
            </div>
          </div>

          {/* Gift Occasions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto mb-10 border-2 border-rose-200 shadow-lg">
            <h3 className="text-2xl font-bold text-brand-primary mb-4">Perfect For</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "🎄 Christmas",
                "🎂 Birthdays",
                "🐾 New Pet Owners",
                "🏡 Pet Adoptions",
                "💝 Just Because",
                "🎁 Foster Parents",
                "🌟 Pet Lovers",
                "🎊 Celebrations"
              ].map((occasion) => (
                <span
                  key={occasion}
                  className="px-4 py-2 bg-gradient-to-r from-rose-100 to-amber-100 rounded-full text-sm font-medium text-brand-primary border border-rose-200"
                >
                  {occasion}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/gift')}
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-rose-700"
            >
              <Gift className="h-5 w-5 mr-2" />
              Give a Gift Subscription
            </Button>
            
            <Button
              onClick={() => navigate('/gift')}
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 border-2 border-brand-primary bg-white/90 backdrop-blur-sm hover:bg-brand-primary hover:text-white transition-all"
            >
              Learn More About Gifting
            </Button>
          </div>

          {/* Gift Details */}
          <p className="text-sm text-brand-primary-dark mt-6 max-w-2xl mx-auto">
            🎁 Instant email delivery • 💌 Personalized message • ⏰ Schedule for special dates • 🔄 Easy activation
          </p>
        </div>
      </div>
    </section>
  );
};
