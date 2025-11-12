import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, Heart, Sparkles, Star, TreePine, Flame, Dog, Snowflake } from "lucide-react";

export const HolidayGiftSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-red-50 via-white to-green-50 py-20 overflow-hidden">
      {/* Snowflakes */}
      <div className="absolute top-10 left-10 text-slate-300 opacity-30">
        <Snowflake className="w-16 h-16" />
      </div>
      <div className="absolute bottom-10 right-10 text-slate-200 opacity-30">
        <Snowflake className="w-20 h-20" />
      </div>
      <div className="absolute top-1/2 left-1/4 text-slate-300 opacity-20">
        <Snowflake className="w-24 h-24" />
      </div>
      <div className="absolute top-1/4 right-1/4 text-slate-200 opacity-25 animate-pulse">
        <Snowflake className="w-18 h-18" />
      </div>
      <div className="absolute bottom-1/3 left-1/3 text-slate-300 opacity-20">
        <Snowflake className="w-14 h-14" />
      </div>
      {/* Christmas Trees */}
      <div className="absolute top-20 right-20 text-emerald-600 opacity-30">
        <TreePine className="w-32 h-32" />
      </div>
      <div className="absolute top-1/3 left-1/2 text-green-600 opacity-20">
        <TreePine className="w-16 h-16" />
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
      {/* Gifts */}
      <div className="absolute top-1/4 left-1/4 text-red-600 opacity-15">
        <Gift className="w-20 h-20" />
      </div>
      <div className="absolute bottom-1/4 right-16 text-red-700 opacity-20">
        <Gift className="w-16 h-16" />
      </div>
      {/* Silver Stars */}
      <div className="absolute bottom-1/3 right-1/4 text-slate-400 opacity-25 animate-pulse">
        <Star className="w-12 h-12" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          {/* Holiday Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-red-500 rounded-full px-6 py-2 mb-6 shadow-lg">
            <Gift className="h-5 w-5 text-red-600" />
            <span className="text-red-700 font-bold text-sm uppercase tracking-wide">
              Perfect Holiday Gift
            </span>
            <Gift className="h-5 w-5 text-red-600" />
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
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-red-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-brand-primary mb-2">Lost Pet Recovery</h3>
              <p className="text-sm text-brand-primary-dark">One-tap flyers & LiveLinks</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-emerald-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-brand-primary mb-2">Digital Records</h3>
              <p className="text-sm text-brand-primary-dark">Medical & travel docs</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-brand-primary mb-2">Housing Resume</h3>
              <p className="text-sm text-brand-primary-dark">Pet screening builder</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-md border border-green-100 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-brand-primary mb-2">Memory Gallery</h3>
              <p className="text-sm text-brand-primary-dark">Unlimited photo storage</p>
            </div>
          </div>

          {/* Gift Occasions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto mb-10 border-2 border-red-200 shadow-lg">
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
                  className="px-4 py-2 bg-gradient-to-r from-red-100 via-white to-green-100 rounded-full text-sm font-medium text-brand-primary border border-red-200"
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
              className="text-lg px-10 py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-red-800"
            >
              <Gift className="h-5 w-5 mr-2" />
              Give a Gift Subscription
            </Button>
            
            <Button
              onClick={() => navigate('/gift')}
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 border-2 border-emerald-600 bg-white/90 backdrop-blur-sm hover:bg-emerald-600 hover:text-white transition-all"
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
